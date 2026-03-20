<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Workspace;
use App\Models\Feature;
use Inertia\Inertia;

class WorkspaceController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/workspaces/index', [
            'workspaces' => Workspace::with(['plan', 'owner'])->get(),
            'features' => Feature::all(),
        ]);
    }

    public function updateLimits(Request $request, Workspace $workspace)
    {
        $validated = $request->validate([
            'custom_limits' => 'nullable|array',
            'custom_limits.*' => 'nullable|string',
        ]);

        $workspace->update([
            'custom_limits' => $validated['custom_limits'],
        ]);

        return redirect()->back()->with('success', 'Workspace limits updated successfully.');
    }
}
