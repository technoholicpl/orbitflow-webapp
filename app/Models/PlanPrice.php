<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PlanPrice extends Model
{
    protected $fillable = [
        'plan_id',
        'type',
        'price',
        'sale_price',
        'lowest_price_30d',
        'sale_start_at',
        'sale_ends_at',
        'is_active',
    ];

    protected $appends = [
        'calculated_lowest_price',
    ];

    protected $casts = [
        'sale_start_at' => 'datetime',
        'sale_ends_at' => 'datetime',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function priceHistories()
    {
        return $this->hasMany(PriceHistory::class);
    }

    /**
     * Get the lowest price in the last 30 days before a given date.
     * 
     * @param string|null $beforeDate Date string (Y-m-d)
     * @return float|null
     */
    public function getLowestPriceLast30Days($referenceDate = null)
    {
        $referenceDate = $referenceDate ? Carbon::parse($referenceDate) : now();
        $thirtyDaysAgo = $referenceDate->copy()->subDays(30);

        // 1. Get the price that was active at the beginning of the 30-day window
        $startingPrice = $this->priceHistories()
            ->where('created_at', '<=', $thirtyDaysAgo)
            ->orderBy('created_at', 'desc')
            ->value('price');

        // 2. Get the minimum price within the 30-day window
        $minInWindow = $this->priceHistories()
            ->whereBetween('created_at', [$thirtyDaysAgo, $referenceDate])
            ->min('price');

        // If no history exists before the window, use the current price as starting point
        if ($startingPrice === null) {
            $startingPrice = $this->price;
        }

        // Return the absolute minimum
        $prices = array_filter([$startingPrice, $minInWindow], fn($p) => $p !== null);
        
        return count($prices) > 0 ? (float)min($prices) : (float)$this->price;
    }

    /**
     * Get the calculated lowest price based on promotion start or current date.
     * 
     * @return float
     */
    public function getCalculatedLowestPriceAttribute()
    {
        $referenceDate = $this->sale_start_at ?: now();
        return $this->getLowestPriceLast30Days($referenceDate);
    }
}
