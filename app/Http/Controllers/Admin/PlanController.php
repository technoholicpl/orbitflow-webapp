<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PlanRequest;
use Illuminate\Http\Request;

use App\Models\Plan;
use App\Models\PlanPrice;
use App\Models\Feature;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PlanController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/plans/index', [
            'plans' => Plan::with(['prices', 'features'])->orderBy('display_order')->get(),
            'features' => Feature::all(),
        ]);
    }

    public function store(PlanRequest $request)
    {
        $validated = $request->validated();

        $plan = Plan::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'is_recommended' => $validated['is_recommended'] ?? false,
            'is_free' => $validated['is_free'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'is_coming_soon' => $validated['is_coming_soon'] ?? false,
            'is_promoted' => $validated['is_promoted'] ?? false,
            'display_order' => $validated['display_order'] ?? 0,
            'trial_days' => $validated['trial_days'] ?? 0,
        ]);

        foreach ($validated['prices'] as $priceData) {
            $planPrice = $plan->prices()->create($priceData);
            
            // Record initial price in history
            $planPrice->priceHistories()->create(['price' => $priceData['price']]);

            // If it's a sale, calculate omnibus price from history
            if (!empty($priceData['sale_price'])) {
                $omnibus = $planPrice->getLowestPriceLast30Days($priceData['sale_start_at'] ?? null);
                $planPrice->update(['lowest_price_30d' => $omnibus]);
            }
        }

        return redirect()->back()->with('success', 'Plan created successfully.');
    }

    public function update(PlanRequest $request, Plan $plan)
    {
        $validated = $request->validated();

        $plan->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'is_recommended' => $validated['is_recommended'] ?? false,
            'is_free' => $validated['is_free'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'is_coming_soon' => $validated['is_coming_soon'] ?? false,
            'is_promoted' => $validated['is_promoted'] ?? false,
            'display_order' => $validated['display_order'] ?? 0,
            'trial_days' => $validated['trial_days'] ?? 0,
        ]);

        // Sync prices
        $existingPriceIds = collect($validated['prices'])->pluck('id')->filter()->toArray();
        $plan->prices()->whereNotIn('id', $existingPriceIds)->delete();

        foreach ($validated['prices'] as $priceData) {
            if (isset($priceData['id'])) {
                $planPrice = PlanPrice::findOrFail($priceData['id']);
                
                // If price changed, record history
                if ((float)$planPrice->price !== (float)$priceData['price']) {
                    $planPrice->priceHistories()->create(['price' => $priceData['price']]);
                }

                // If sale started/changed, update omnibus price
                if (!empty($priceData['sale_price'])) {
                    $priceData['lowest_price_30d'] = $planPrice->getLowestPriceLast30Days($priceData['sale_start_at'] ?? null);
                }

                $planPrice->update($priceData);
            } else {
                $planPrice = $plan->prices()->create($priceData);
                $planPrice->priceHistories()->create(['price' => $priceData['price']]);

                if (!empty($priceData['sale_price'])) {
                    $omnibus = $planPrice->getLowestPriceLast30Days($priceData['sale_start_at'] ?? null);
                    $planPrice->update(['lowest_price_30d' => $omnibus]);
                }
            }
        }

        return redirect()->back()->with('success', 'Plan updated successfully.');
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();
        return redirect()->back()->with('success', 'Plan deleted successfully.');
    }

    public function updateFeatures(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'features' => 'required|array',
            'features.*.id' => 'required|exists:features,id',
            'features.*.value' => 'required|string',
            'features.*.period' => 'nullable|string|in:daily,weekly,monthly',
        ]);

        $syncData = [];
        foreach ($validated['features'] as $f) {
            $syncData[$f['id']] = [
                'value' => $f['value'],
                'period' => $f['period'] ?? null,
            ];
        }

        $plan->features()->sync($syncData);

        return redirect()->back()->with('success', 'Features updated successfully.');
    }
}
