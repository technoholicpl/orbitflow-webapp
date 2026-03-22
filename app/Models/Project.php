<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'workspace_id',
        'client_id',
        'brand_id',
        'workspace_action_id',
        'name',
        'slug',
        'description',
        'status',
        'priority',
        'spent_time',
        'count_by_hours',
        'deadline',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($project) {
            if (empty($project->slug)) {
                $project->slug = \Illuminate\Support\Str::slug($project->name) . '-' . \Illuminate\Support\Str::random(5);
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    protected $appends = ['total_time'];

    protected $casts = [
        'spent_time' => 'integer',
        'count_by_hours' => 'boolean',
        'deadline' => 'date',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function workspaceAction(): BelongsTo
    {
        return $this->belongsTo(WorkspaceAction::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function labels(): \Illuminate\Database\Eloquent\Relations\MorphToMany
    {
        return $this->morphToMany(Label::class, 'labelable');
    }

    public function members(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user');
    }

    public function getTotalTimeAttribute()
    {
        return $this->spent_time;
    }
}
