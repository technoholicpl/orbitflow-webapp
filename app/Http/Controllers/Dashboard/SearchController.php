<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Client;
use App\Models\User;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('q', '');
        $workspace = $request->user()->currentWorkspace;

        if (!$workspace || mb_strlen($query) < 2) {
            return response()->json([
                'projects' => [],
                'clients' => [],
                'members' => [],
            ]);
        }

        $projects = $workspace->projects()
            ->where('name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'slug']);

        $clients = $workspace->clients()
            ->where(function ($q) use ($query) {
                $q->where('company_name', 'like', "%{$query}%")
                  ->orWhere('first_name', 'like', "%{$query}%")
                  ->orWhere('last_name', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get(['id', 'company_name', 'first_name', 'last_name']);

        $clients = $clients->map(function ($client) {
            return [
                'id' => $client->id,
                'name' => $client->company_name ?: "{$client->first_name} {$client->last_name}",
            ];
        });

        $members = $workspace->users()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get(['users.id', 'users.name', 'users.email']);

        return response()->json([
            'projects' => $projects,
            'clients' => $clients,
            'members' => $members,
        ]);
    }
}
