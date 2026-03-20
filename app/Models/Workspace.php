<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workspace extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'identifier',
        'owner_id',
        'plan_id',
        'subscription_status',
        'subscription_ends_at',
        'trial_ends_at',
        'billing_cycle',
    ];

    protected $casts = [
        'subscription_ends_at' => 'datetime',
        'trial_ends_at' => 'datetime',
    ];

    public function isOnTrial(): bool
    {
        if ($this->subscription_status !== 'trialing') {
            return false;
        }

        if (!$this->trial_ends_at) {
            return false;
        }

        return $this->trial_ends_at->isFuture();
    }

    public function getTrialDaysRemaining(): int
    {
        if (!$this->isOnTrial()) {
            return 0;
        }

        return (int) now()->diffInDays($this->trial_ends_at);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function hasFeature(string $featureSlug): bool
    {
        if (!$this->plan) return false;
        
        $feature = $this->plan->features()->where('slug', $featureSlug)->first();
        if (!$feature) return false;
        
        $value = $feature->pivot->value;
        return $value === 'true' || $value === 'unlimited' || (is_numeric($value) && (int)$value > 0);
    }

    public function isWithinLimit(string $featureSlug, string $relationship): bool
    {
        if (!$this->plan) return false;
        
        $feature = $this->plan->features()->where('slug', $featureSlug)->first();
        if (!$feature) return true; // If feature not defined for plan, assume no limit or handled elsewhere

        $limit = $feature->pivot->value;
        if ($limit === 'unlimited') return true;
        
        $period = $feature->pivot->period;
        $count = $this->getUsageCount($relationship, $period);

        return $count < (int) $limit;
    }

    public function getUsageCount(string $relationship, ?string $period): int
    {
        $query = $this->$relationship();
        
        if ($period === 'daily') {
            $query->where('created_at', '>=', now()->startOfDay());
        } elseif ($period === 'weekly') {
            $query->where('created_at', '>=', now()->startOfWeek());
        } elseif ($period === 'monthly') {
            $query->where('created_at', '>=', now()->startOfMonth());
        }
        
        return $query->count();
    }

    public function canCreateProject(): bool
    {
        // Check total projects limit
        if (!$this->isWithinLimit('max-projects', 'projects')) {
            return false;
        }

        // Check period projects limit (if exists)
        // We'll look for a feature that has a period set
        $periodFeature = $this->plan->features()
            ->where('slug', 'like', 'max-projects%')
            ->whereNotNull('period')
            ->first();

        if ($periodFeature && !$this->isWithinLimit($periodFeature->slug, 'projects')) {
            return false;
        }

        return true;
    }

    public function getMonthlyProjectLimitRemaining(): int
    {
        // This is a helper, but we should make it generic too if needed.
        return 0; // Placeholder
    }

    public function getFeatureLimit(string $featureSlug): int
    {
        if (!$this->plan) return 0;
        
        $feature = $this->plan->features()->where('slug', $featureSlug)->first();
        if (!$feature) return 0;

        if ($feature->pivot->value === 'unlimited') {
            return 999999;
        }
        
        return (int) $feature->pivot->value;
    }

    public function isFeatureUnlimited(string $featureSlug): bool
    {
        if (!$this->plan) return false;
        
        $feature = $this->plan->features()->where('slug', $featureSlug)->first();
        if (!$feature) return false;
        
        return $feature->pivot->value === 'unlimited';
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_workspace')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function clients(): HasMany
    {
        return $this->hasMany(Client::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class, 'workspace_label');
    }

    public function actionTypes(): BelongsToMany
    {
        return $this->belongsToMany(ActionType::class, 'workspace_actions');
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }
}
