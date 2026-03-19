<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Label extends Model
{
    use HasFactory;
    protected $casts = [
        'name' => 'string',
        'color' => 'string',
    ];


    protected $table= 'labels';

    protected $fillable = [
        'name',
        'slug',
        'color',
    ];
    public function workspaces(): BelongsToMany
    {
        return $this->belongsToMany(Workspace::class, 'workspace_label');
    }

    public function tasks(): MorphToMany
    {
        return $this->morphedByMany(Task::class, 'labelable');
    }

    public function projects(): MorphToMany
    {
        return $this->morphedByMany(Project::class, 'labelable');
    }
}
