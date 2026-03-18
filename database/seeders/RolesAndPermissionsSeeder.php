<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // --- Admin Roles (Global) ---
        // Guard: admins
        Role::updateOrCreate(['name' => 'administrator', 'guard_name' => 'admins']);
        Role::updateOrCreate(['name' => 'moderator', 'guard_name' => 'admins']);
        Role::updateOrCreate(['name' => 'redaktor', 'guard_name' => 'admins']);

        // --- User Roles (Workspace Scoped / Teams) ---
        // Guard: web
        Role::updateOrCreate(['name' => 'Owner', 'guard_name' => 'web']);
        Role::updateOrCreate(['name' => 'Employee', 'guard_name' => 'web']);
        Role::updateOrCreate(['name' => 'Client', 'guard_name' => 'web']);

        // Define some basic permissions
        $permissions = [
            'view dashboard',
            'manage workspace',
            'manage members',
            'view projects',
            'create projects',
            'edit projects',
            'delete projects',
            'view tasks',
            'create tasks',
            'edit tasks',
            'delete tasks',
            'view clients',
            'manage clients',
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(['name' => $permission, 'guard_name' => 'web']);
            Permission::updateOrCreate(['name' => $permission, 'guard_name' => 'admins']);
        }

        // Assign all permissions to Owner and administrator
        $ownerRole = Role::where('name', 'Owner')->where('guard_name', 'web')->first();
        $adminRole = Role::where('name', 'administrator')->where('guard_name', 'admins')->first();

        $allPermissionsWeb = Permission::where('guard_name', 'web')->get();
        $allPermissionsAdmins = Permission::where('guard_name', 'admins')->get();

        $ownerRole->syncPermissions($allPermissionsWeb);
        $adminRole->syncPermissions($allPermissionsAdmins);
    }
}
