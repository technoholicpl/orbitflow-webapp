<?php

namespace App\Http\Controllers\Dashboard;
use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $workspaceId = $request->user()->current_workspace_id; // Assume this logic exists or will be added to User

        $clients = Client::where('workspace_id', $workspaceId)
            ->with('brands')
            ->orderBy('company_name')
            ->orderBy('last_name')
            ->get();

        return Inertia::render('dashboard/clients/index', [
            'clients' => $clients
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/clients/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:business,individual',
            'company_name' => 'required_if:type,business|nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'first_name' => 'required_if:type,individual|nullable|string|max:255',
            'last_name' => 'required_if:type,individual|nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'note' => 'nullable|string',
            'brands' => 'nullable|array',
            'brands.*.name' => 'required|string|max:255',
            'brands.*.description' => 'nullable|string',
            'brands.*.website' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $workspace = null;

        if ($user instanceof \App\Models\User) {
            $workspace = $user->currentWorkspace;
        } else if ($user instanceof \App\Models\Admin) {
            // For admins, we pick the first workspace as a fallback for now
            // In a real scenario, we might want to allow them to pick one or handle it differently
            $workspace = \App\Models\Workspace::first();
        }

        if (!$workspace) {
            return response()->json(['message' => 'No active workspace found'], 422);
        }
        
        $client = $workspace->clients()->create(collect($validated)->except('brands')->toArray());

        if (!empty($validated['brands'])) {
            foreach ($validated['brands'] as $brandData) {
                $client->brands()->create(array_merge($brandData, [
                    'workspace_id' => $workspace->id
                ]));
            }
        }

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Client created successfully', 'client' => $client]);
        }

        return redirect()->route('clients.index');
    }

    public function edit(Client $client)
    {
        return Inertia::render('dashboard/clients/edit', [
            'client' => $client->load('brands')
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'type' => 'required|in:business,individual',
            'company_name' => 'required_if:type,business|nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'first_name' => 'required_if:type,individual|nullable|string|max:255',
            'last_name' => 'required_if:type,individual|nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'note' => 'nullable|string',
            'brands' => 'nullable|array',
            'brands.*.name' => 'required|string|max:255',
            'brands.*.description' => 'nullable|string',
            'brands.*.website' => 'nullable|string|max:255',
        ]);

        $client->update(collect($validated)->except('brands')->toArray());

        if (isset($validated['brands'])) {
            $client->brands()->delete();
            foreach ($validated['brands'] as $brandData) {
                $client->brands()->create(array_merge($brandData, [
                    'workspace_id' => $client->workspace_id
                ]));
            }
        }

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Client updated successfully', 'client' => $client->load('brands')]);
        }

        return redirect()->route('clients.index');
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return redirect()->route('clients.index');
    }
}
