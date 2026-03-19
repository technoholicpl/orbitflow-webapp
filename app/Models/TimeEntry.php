<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'project_id',
        'task_id',
        'user_id',
        'description',
        'started_at',
        'ended_at',
        'duration',
        'is_manual',
        'recovery_dismissed',
        'last_reminded_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration' => 'integer',
        'is_manual' => 'boolean',
        'recovery_dismissed' => 'boolean',
        'last_reminded_at' => 'datetime',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function currentJob(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UserCurrentJob::class, 'time_entry_id');
    }
}
