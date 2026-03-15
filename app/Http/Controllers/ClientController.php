<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $workspaceId = $request->user()->current_workspace_id; // Assume this logic exists or will be added to User
        
        $clients = Client::where('workspace_id', $workspaceId)
            ->orderBy('company_name')
            ->orderBy('last_name')
            ->get();

        return Inertia::render('clients/index', [
            'clients' => $clients
        ]);
    }

    public function create()
    {
        return Inertia::render('clients/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:business,individual',
            'company_name' => 'required_if:type,business',
            'first_name' => 'required_if:type,individual',
            'last_name' => 'required_if:type,individual',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
        ]);

        $request->user()->currentWorkspace->clients()->create($validated);

        return redirect()->route('clients.index');
    }

    public function edit(Client $client)
    {
        return Inertia::render('clients/edit', [
            'client' => $client
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'type' => 'required|in:business,individual',
            'company_name' => 'required_if:type,business',
            'first_name' => 'required_if:type,individual',
            'last_name' => 'required_if:type,individual',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
        ]);

        $client->update($validated);

        return redirect()->route('clients.index');
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return redirect()->route('clients.index');
    }
}
