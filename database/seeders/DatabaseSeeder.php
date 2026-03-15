<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\User;
use App\Models\Workspace;
use App\Models\Client;
use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Admins
        Admin::create([
            'name' => 'OrbitFlow SuperAdmin',
            'email' => 'admin@orbitflow.com',
            'password' => Hash::make('password'),
            'is_superadmin' => true,
        ]);

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
            'total_time' => 7200,
        ]);

        Project::create([
            'workspace_id' => $workspace->id,
            'client_id' => $client->id,
            'name' => 'Backend API',
            'description' => 'Scalable microservices for the core platform',
            'status' => 'new',
            'priority' => 'medium',
            'deadline' => now()->addMonths(3),
            'total_time' => 0,
        ]);
    }
}
