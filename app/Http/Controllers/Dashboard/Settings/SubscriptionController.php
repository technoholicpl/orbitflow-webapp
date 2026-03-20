<?php

namespace App\Http\Controllers\Dashboard\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Plan;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $workspace = $request->user()->currentWorkspace;
        $plans = Plan::where('is_active', true)
            ->with(['prices' => fn($q) => $q->where('is_active', true)])
            ->with('features')
            ->orderBy('display_order')
            ->get();

        return Inertia::render('dashboard/settings/subscription/index', [
            'workspace' => $workspace ? $workspace->load('plan') : null,
            'plans' => $plans
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|string|in:month,year',
            'coupon_code' => 'nullable|string|exists:coupons,code',
        ]);

        $workspace = $request->user()->currentWorkspace;
        $plan = Plan::find($request->plan_id);
        
        if (!$workspace) {
            return redirect()->back()->withErrors(['message' => 'No active workspace found.']);
        }

        $data = [
            'plan_id' => $plan->id,
            'coupon_code' => $request->coupon_code,
            'billing_cycle' => $request->billing_cycle,
            'subscription_status' => 'active',
            'trial_ends_at' => null,
        ];

        // If the plan has trial days and the workspace is currently on a free/trial plan
        if ($plan->trial_days > 0 && ($workspace->subscription_status === 'trialing' || !$workspace->plan_id || $workspace->plan?->is_free)) {
            $data['subscription_status'] = 'trialing';
            $data['trial_ends_at'] = now()->addDays($plan->trial_days);
        }

        $workspace->update($data);

        return redirect()->back()->with('success', $data['subscription_status'] === 'trialing' ? 'Testowanie planu rozpoczęte!' : 'Subskrypcja zaktualizowana!');
    }
}
