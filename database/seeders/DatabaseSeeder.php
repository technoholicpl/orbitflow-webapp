<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\User;
use App\Models\Workspace;
use App\Models\Client;
use App\Models\Project;
use App\Models\ActionType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Initialize Roles and Permissions
        $this->call(RolesAndPermissionsSeeder::class);

        // Seed Admins
        $admin = Admin::create([
            'name' => 'OrbitFlow SuperAdmin',
            'email' => 'admin@orbitflow.com',
            'password' => Hash::make('password'),
            'is_superadmin' => true,
        ]);

        // Assign global admin role
        app(PermissionRegistrar::class)->setPermissionsTeamId(null);
        $admin->assignRole('administrator');
        
        // Seed default ActionTypes
        $defaultActions = [
            ['name' => 'Project', 'description' => 'General project management', 'color' => '#3b82f6', 'icon' => 'Activity', 'system' => true],
            ['name' => 'Coding', 'description' => 'Development and programming', 'color' => '#10b981', 'icon' => 'Code', 'system' => true],
            ['name' => 'Modification', 'description' => 'Changes and updates', 'color' => '#f59e0b', 'icon' => 'Settings', 'system' => true],
            ['name' => 'Bug', 'description' => 'Fixing issues and errors', 'color' => '#ef4444', 'icon' => 'AlertCircle', 'system' => true],
        ];

        foreach ($defaultActions as $action) {
            ActionType::firstOrCreate(['name' => $action['name']], $action);
        }

        // Seed Users
        $user = User::create([
            'name' => 'Test User',
            'email' => 'user@orbitflow.com',
            'password' => Hash::make('password'),
            'account_type' => 'company',
            'company_name' => 'Acme Corp',
        ]);

        // Create Workspace for user
        $workspace = Workspace::create([
            'name' => 'Acme Main Workspace',
            'slug' => 'acme-main',
            'identifier' => 'acme_1',
            'owner_id' => $user->id,
        ]);

        $user->workspaces()->attach($workspace->id, ['role' => 'owner']);
        $user->update(['current_workspace_id' => $workspace->id]);

        // Assign workspace-scoped role
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspace->id);
        $user->assignRole('Owner');

        // Create initial Clients
        $client = Client::create([
            'workspace_id' => $workspace->id,
            'type' => 'business',
            'company_name' => 'Client One Ltd',
            'email' => 'contact@clientone.com',
            'is_active' => true,
        ]);

        // Create initial Project
        Project::create([
            'workspace_id' => $workspace->id,
            'client_id' => $client->id,
            'name' => 'Website Redesign',
            'description' => 'Migrating corporate site to Inertia React',
            'status' => 'in progress',
            'priority' => 'high',
            'deadline' => now()->addMonths(2),
            'spent_time' => 7200,
        ]);

        Project::create([
            'workspace_id' => $workspace->id,
            'client_id' => $client->id,
            'name' => 'Backend API',
            'description' => 'Scalable microservices for the core platform',
            'status' => 'new',
            'priority' => 'medium',
            'deadline' => now()->addMonths(3),
            'spent_time' => 0,
        ]);
    }
}
