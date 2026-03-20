<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_recommended' => 'boolean',
            'is_free' => 'boolean',
            'is_active' => 'boolean',
            'is_coming_soon' => 'boolean',
            'display_order' => 'integer',
            'trial_days' => 'nullable|integer|min:0',
            'prices' => 'required|array',
            'prices.*.type' => 'required|string|in:month,year',
            'prices.*.price' => 'required|numeric|min:0',
            'prices.*.sale_price' => 'nullable|numeric|min:0',
            'prices.*.lowest_price_30d' => 'nullable|numeric|min:0',
        ]);

        $plan = Plan::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'is_recommended' => $validated['is_recommended'] ?? false,
            'is_free' => $validated['is_free'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'is_coming_soon' => $validated['is_coming_soon'] ?? false,
            'display_order' => $validated['display_order'] ?? 0,
            'trial_days' => $validated['trial_days'] ?? 0,
        ]);

        foreach ($validated['prices'] as $priceData) {
            $plan->prices()->create($priceData);
        }

        return redirect()->back()->with('success', 'Plan created successfully.');
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_recommended' => 'boolean',
            'is_free' => 'boolean',
            'is_active' => 'boolean',
            'is_coming_soon' => 'boolean',
            'display_order' => 'integer',
            'trial_days' => 'nullable|integer|min:0',
            'prices' => 'required|array',
            'prices.*.id' => 'nullable|exists:plan_prices,id',
            'prices.*.type' => 'required|string|in:month,year',
            'prices.*.price' => 'required|numeric|min:0',
            'prices.*.sale_price' => 'nullable|numeric|min:0',
            'prices.*.lowest_price_30d' => 'nullable|numeric|min:0',
        ]);

        $plan->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'is_recommended' => $validated['is_recommended'] ?? false,
            'is_free' => $validated['is_free'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'is_coming_soon' => $validated['is_coming_soon'] ?? false,
            'display_order' => $validated['display_order'] ?? 0,
            'trial_days' => $validated['trial_days'] ?? 0,
        ]);

        // Sync prices
        $existingPriceIds = collect($validated['prices'])->pluck('id')->filter()->toArray();
        $plan->prices()->whereNotIn('id', $existingPriceIds)->delete();

        foreach ($validated['prices'] as $priceData) {
            if (isset($priceData['id'])) {
                PlanPrice::where('id', $priceData['id'])->update($priceData);
            } else {
                $plan->prices()->create($priceData);
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
