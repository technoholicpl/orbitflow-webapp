<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanPrice extends Model
{
    protected $fillable = [
        'plan_id',
        'type',
        'price',
        'sale_price',
        'lowest_price_30d',
        'is_active',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
}
