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

        return Inertia::render('dashboard/settings/members/index', [
            'members' => $members,
            'availableRoles' => $availableRoles,
            'availablePermissions' => $availablePermissions,
            'workspaceName' => $workspace->name,
        ]);
    }

    /**
     * Add a member to the workspace.
     * (Simplified version: direct add by email if user exists)
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|string|exists:roles,name',
        ]);

        $workspace = $request->user()->currentWorkspace;
        $userToAdd = User::where('email', $request->email)->first();

        if ($workspace->users()->where('user_id', $userToAdd->id)->exists()) {
            return back()->withErrors(['email' => 'User is already a member of this workspace.']);
        }

        DB::transaction(function () use ($workspace, $userToAdd, $request) {
            $workspace->users()->attach($userToAdd, ['role' => strtolower($request->role)]);

            // Assign Spatie Role
            setPermissionsTeamId($workspace->id);
            $userToAdd->assignRole($request->role);

            // Set current workspace if not set
            if (!$userToAdd->current_workspace_id) {
                $userToAdd->update(['current_workspace_id' => $workspace->id]);
            }
        });

        return back()->with('status', 'Member added successfully.');
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
