<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PriceHistory extends Model
{
    protected $fillable = [
        'plan_price_id',
        'price',
        'created_at',
    ];

    public function planPrice()
    {
        return $this->belongsTo(PlanPrice::class);
    }
}
