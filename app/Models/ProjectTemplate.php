<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectTemplate extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'icon', 'tasks'];

    protected $casts = [
        'tasks' => 'array',
    ];
}
