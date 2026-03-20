<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_recommended',
        'is_free',
        'is_active',
        'is_coming_soon',
        'display_order',
        'trial_days',
    ];

    public function prices()
    {
        return $this->hasMany(PlanPrice::class);
    }

    public function features()
    {
        return $this->belongsToMany(Feature::class, 'plan_feature')
            ->withPivot(['value', 'period'])
            ->withTimestamps();
    }

    public function workspaces()
    {
        return $this->hasMany(Workspace::class);
    }
}
