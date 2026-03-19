<?php

namespace App\Http\Controllers\Dashboard\Settings;

use App\Models\User;
use App\Models\Workspace;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class WorkspaceMemberController extends Controller
{
    /**
     * Display a listing of the workspace members.
     */
    public function index(Request $request)
    {
        $workspace = $request->user()->currentWorkspace;

        $members = $workspace->users()->get()->map(function ($user) use ($workspace) {
            setPermissionsTeamId($workspace->id);
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'role' => $user->getRoleNames()->first() ?? 'Member',
                'joined_at' => $user->pivot->created_at ? $user->pivot->created_at->diffForHumans() : 'Recently',
                'is_owner' => $user->pivot->role === 'owner' || $workspace->owner_id === $user->id,
            ];
        });

        $availableRoles = Role::where('guard_name', 'web')->pluck('name');
        $availablePermissions = Permission::where('guard_name', 'web')->pluck('name');

        $invitations = $workspace->invitations()
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->get()
            ->map(function($invitation) {
                return [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'role' => ucfirst($invitation->role),
                    'created_at' => $invitation->created_at->diffForHumans(),
                    'token' => $invitation->token,
                    'is_pending' => true,
                ];
            });

        return Inertia::render('dashboard/settings/members/index', [
            'members' => $members,
            'invitations' => $invitations,
            'availableRoles' => $availableRoles,
            'availablePermissions' => $availablePermissions,
            'workspaceName' => $workspace->name,
        ]);
    }

    /**
     * Send an invitation to join the workspace.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'role' => 'required|string|exists:roles,name',
        ]);

        $workspace = $request->user()->currentWorkspace;
        $user = $request->user();

        // Check if already a member
        if ($workspace->users()->where('email', $request->email)->exists()) {
            return back()->withErrors(['email' => 'Ten użytkownik jest już członkiem tej przestrzeni.']);
        }

        // Check if already invited (and not expired)
        if (\App\Models\Invitation::where('workspace_id', $workspace->id)
            ->where('email', $request->email)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->exists()) {
            return back()->withErrors(['email' => 'Zaproszenie zostało już wysłane do tego użytkownika.']);
        }

        $invitation = \App\Models\Invitation::create([
            'workspace_id' => $workspace->id,
            'inviter_id' => $user->id,
            'email' => $request->email,
            'token' => \Illuminate\Support\Str::random(40),
            'role' => $request->role,
            'expires_at' => now()->addDays(7),
        ]);

        // Send notification
        $invitedUser = User::where('email', $request->email)->first();
        if ($invitedUser) {
            $invitedUser->notify(new \App\Notifications\WorkspaceInvitation($invitation));
        } else {
            \Illuminate\Support\Facades\Notification::route('mail', $request->email)
                ->notify(new \App\Notifications\WorkspaceInvitation($invitation));
        }

        return back()->with('status', 'Zaproszenie zostało wysłane pomyślnie.');
    }

    /**
     * Cancel a pending invitation.
     */
    public function cancelInvitation($id)
    {
        $workspace = auth()->user()->currentWorkspace;
        $invitation = \App\Models\Invitation::where('workspace_id', $workspace->id)
            ->where('id', $id)
            ->firstOrFail();

        $invitation->delete();

        return back()->with('status', 'Zaproszenie zostało anulowane.');
    }

    /**
     * Resend a pending invitation.
     */
    public function resendInvitation($id)
    {
        $workspace = auth()->user()->currentWorkspace;
        $invitation = \App\Models\Invitation::where('workspace_id', $workspace->id)
            ->where('id', $id)
            ->firstOrFail();

        // Refresh token and expiry
        $invitation->update([
            'token' => \Illuminate\Support\Str::random(40),
            'expires_at' => now()->addDays(7),
        ]);

        // Send notification again
        $invitedUser = User::where('email', $invitation->email)->first();
        if ($invitedUser) {
            $invitedUser->notify(new \App\Notifications\WorkspaceInvitation($invitation));
        } else {
            \Illuminate\Support\Facades\Notification::route('mail', $invitation->email)
                ->notify(new \App\Notifications\WorkspaceInvitation($invitation));
        }

        return back()->with('status', 'Zaproszenie zostało wysłane ponownie.');
    }

    /**
     * Update the member's role.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $workspace = $request->user()->currentWorkspace;
        $member = User::findOrFail($id);

        if ($workspace->owner_id === $member->id) {
            return back()->withErrors(['role' => 'Cannot change role of the workspace owner.']);
        }

        setPermissionsTeamId($workspace->id);
        $member->syncRoles([$request->role]);
        $workspace->users()->updateExistingPivot($member->id, ['role' => strtolower($request->role)]);

        return back()->with('status', 'Member role updated.');
    }

    /**
     * Remove a member from the workspace.
     */
    public function destroy(Request $request, $id)
    {
        $workspace = $request->user()->currentWorkspace;
        $member = User::findOrFail($id);

        if ($workspace->owner_id === $member->id) {
            return back()->withErrors(['member' => 'Cannot remove the workspace owner.']);
        }

        DB::transaction(function () use ($workspace, $member) {
            $workspace->users()->detach($member->id);

            setPermissionsTeamId($workspace->id);
            $member->roles()->detach(); // Remove roles for this team context

            if ($member->current_workspace_id === $workspace->id) {
                $nextWorkspace = $member->workspaces()->first();
                $member->update(['current_workspace_id' => $nextWorkspace ? $nextWorkspace->id : null]);
            }
        });

        return back()->with('status', 'Member removed.');
    }

    /**
     * Update the member's granular permissions.
     */
    public function updatePermissions(Request $request, $id)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $workspace = $request->user()->currentWorkspace;
        $member = User::findOrFail($id);

        setPermissionsTeamId($workspace->id);
        $member->syncPermissions($request->permissions);

        return back()->with('status', 'Permissions updated.');
    }

    /**
     * Get member's current permissions.
     */
    public function getPermissions(Request $request, $id)
    {
        $workspace = $request->user()->currentWorkspace;
        $member = User::findOrFail($id);

        setPermissionsTeamId($workspace->id);

        return response()->json([
            'permissions' => $member->getPermissionNames(),
        ]);
    }
}
