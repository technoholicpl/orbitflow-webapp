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
        $step = $request->user()->current_workspace_id ? 2 : 1;
        
        return Inertia::render('dashboard/onboarding/index', [
            'initialStep' => $step
        ]);
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
            ]);

            $user->workspaces()->attach($workspace->id, ['role' => 'owner']);
            $user->current_workspace_id = $workspace->id;
            $user->save();

            if ($request->filled('invites')) {
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

                    // Send notification
                    $invitedUser = \App\Models\User::where('email', $email)->first();
                    if ($invitedUser) {
                        $invitedUser->notify(new \App\Notifications\WorkspaceInvitation($invitation));
                    } else {
                        \Illuminate\Support\Facades\Notification::route('mail', $email)
                            ->notify(new \App\Notifications\WorkspaceInvitation($invitation));
                    }
                }
            }

            return redirect()->back()
                ->with('status', 'Workspace created successfully!');
        });
    }
}
