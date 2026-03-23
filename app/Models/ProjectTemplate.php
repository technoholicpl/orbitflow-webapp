<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectTemplate extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'icon', 'tasks', 'workspace_id', 'is_active'];

    protected $casts = [
        'tasks' => 'array',
    ];
}
