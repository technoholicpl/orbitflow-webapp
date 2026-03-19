<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'workspace_id',
        'project_id',
        'workspace_action_id',
        'name',
        'description',
        'estimated_time',
        'spent_time',
        'done_at',
    ];

    protected $casts = [
        'estimated_time' => 'integer',
        'done_at' => 'datetime',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function workspaceAction(): BelongsTo
    {
        return $this->belongsTo(WorkspaceAction::class);
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }

    public function labels(): \Illuminate\Database\Eloquent\Relations\MorphToMany
    {
        return $this->morphToMany(Label::class, 'labelable');
    }
}
