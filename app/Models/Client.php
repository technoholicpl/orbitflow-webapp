<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'workspace_id',
        'type',
        'company_name',
        'tax_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'website',
        'note',
        'is_active',
        'package_hours',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'package_hours' => 'integer',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function getNameAttribute(): ?string
    {
        if ($this->type === 'business') {
            return $this->company_name;
        }

        return trim($this->first_name . ' ' . $this->last_name);
    }
}
