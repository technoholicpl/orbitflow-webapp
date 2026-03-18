<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AdminManagementController extends Controller
{
    /**
     * Display a listing of the admins.
     */
    public function index()
    {
        $admins = Admin::all()->map(function ($admin) {
            return [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->getRoleNames()->first() ?? 'No Role',
                'created_at' => $admin->created_at->toDateTimeString(),
            ];
        });

        $roles = Role::where('guard_name', 'admins')->pluck('name');

        return Inertia::render('admin/admins/index', [
            'admins' => $admins,
            'availableRoles' => $roles,
        ]);
    }

    /**
     * Update the admin's role.
     */
    public function updateRole(Request $request, Admin $admin)
    {
        $request->validate([
            'role' => 'required|string|exists:roles,name,guard_name,admins',
        ]);

        setPermissionsTeamId(0);
        $admin->syncRoles([$request->role]);

        return back()->with('status', 'Admin role updated.');
    }

    /**
     * Remove an admin.
     */
    public function destroy(Admin $admin)
    {
        if (Admin::count() <= 1) {
            return back()->withErrors(['admin' => 'Cannot delete the last administrator.']);
        }

        $admin->delete();

        return back()->with('status', 'Admin deleted.');
    }
}
