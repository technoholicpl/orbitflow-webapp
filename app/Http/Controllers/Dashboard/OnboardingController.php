<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Workspace;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OnboardingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;
        
        $step = 1;
        if ($workspace) {
            $step = $workspace->plan_id ? 3 : 2;
        }

        $plans = \App\Models\Plan::where('is_active', true)
            ->with(['prices' => fn($q) => $q->where('is_active', true)])
            ->with('features')
            ->orderBy('display_order')
            ->get();
        
        return Inertia::render('dashboard/onboarding/index', [
            'initialStep' => $step,
            'plans' => $plans
        ]);
    }

    public function selectPlan(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|string|in:month,year',
        ]);

        $user = $request->user();
        $workspace = $user->currentWorkspace;

        if (!$workspace) {
            return redirect()->route('onboarding.index')->withErrors(['name' => 'Please create a workspace first.']);
        }

        $plan = \App\Models\Plan::findOrFail($request->plan_id);
        
        $workspace->update([
            'plan_id' => $plan->id,
            'billing_cycle' => $request->billing_cycle,
            'subscription_status' => $plan->is_free ? 'active' : ($plan->trial_days > 0 ? 'trialing' : 'active'),
            'trial_ends_at' => (!$plan->is_free && $plan->trial_days > 0) ? now()->addDays($plan->trial_days) : null,
        ]);

        return redirect()->back()->with('success', 'Plan ' . $plan->name . ' selected successfully!');
    }

    public function store(Request $request)
    {
        // Filter out empty invites before validation
        if ($request->has('invites')) {
            $request->merge([
                'invites' => array_values(array_filter($request->invites, fn($email) => !empty($email)))
            ]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'invites' => 'nullable|array',
            'invites.*' => 'email',
        ]);

        return DB::transaction(function () use ($request) {
            $user = $request->user();

            $workspace = Workspace::create([
                'name' => $request->name,
                'slug' => \Illuminate\Support\Str::slug($request->name) . '-' . \Illuminate\Support\Str::random(5),
                'owner_id' => $user->id,
                'identifier' => \Illuminate\Support\Str::random(10),
                'plan_id' => \App\Models\Plan::where('is_free', true)->first()?->id,
                'subscription_status' => 'active',
            ]);

            $user->workspaces()->attach($workspace->id, ['role' => 'owner']);
            $user->current_workspace_id = $workspace->id;
            $user->save();

            return redirect()->back()
                ->with('status', 'Workspace created successfully!');
        });
    }

    public function finish(Request $request)
    {
        $request->validate([
            'invites' => 'nullable|array',
            'invites.*' => 'email',
            'companySize' => 'nullable|string',
            'industry' => 'nullable|string',
            'referralSource' => 'nullable|string',
        ]);

        $user = $request->user();
        $workspace = $user->currentWorkspace;

        if ($request->filled('invites')) {
            $inviteCount = count(array_filter($request->invites));
            if (!$workspace->checkLimit('max-users', 1 + $inviteCount)) {
                return redirect()->back()->withErrors(['invites' => 'Przekroczono limit użytkowników dla Twojego planu. Możesz zaprosić mniej osób lub uaktualnić plan później.']);
            }

            foreach ($request->invites as $email) {
                if (empty($email)) continue;
                
                $invitation = Invitation::create([
                    'workspace_id' => $workspace->id,
                    'inviter_id' => $user->id,
                    'email' => $email,
                    'token' => \Illuminate\Support\Str::random(40),
                    'role' => 'Employee',
                    'expires_at' => now()->addDays(7),
                ]);

                $invitedUser = \App\Models\User::where('email', $email)->first();
                if ($invitedUser) {
                    $invitedUser->notify(new \App\Notifications\WorkspaceInvitation($invitation));
                } else {
                    \Illuminate\Support\Facades\Notification::route('mail', $email)
                        ->notify(new \App\Notifications\WorkspaceInvitation($invitation));
                }
            }
        }

        // Save survey data if needed (optional)
        // ...

        return redirect()->route('dashboard');
    }
}
