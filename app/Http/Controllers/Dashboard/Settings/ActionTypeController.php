<?php

namespace App\Http\Controllers\Dashboard\Settings;

use App\Models\ActionType;
use App\Models\Workspace;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ActionTypeController extends Controller
{
    /**
     * Display a listing of the action types.
     */
    public function index(Request $request)
    {
        $workspace = $request->user()->currentWorkspace;

        // Get action types linked to this workspace
        $actionTypes = $workspace->actionTypes()
            ->orderBy('system', 'desc')
            ->orderBy('name', 'asc')
            ->get();

        // Get available system templates that are not yet linked
        $linkedSystemIds = $actionTypes->where('system', true)->pluck('id');
        $systemTemplates = ActionType::where('system', true)
            ->whereNotIn('id', $linkedSystemIds)
            ->get();

        return Inertia::render('dashboard/settings/action-types/index', [
            'actionTypes' => $actionTypes,
            'systemTemplates' => $systemTemplates,
            'workspaceName' => $workspace->name,
        ]);
    }

    /**
     * Store a newly created action type and link it to the workspace.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
        ]);

        $workspace = $request->user()->currentWorkspace;

        DB::transaction(function () use ($request, $workspace) {
            $actionType = ActionType::create([
                'workspace_id' => $workspace->id,
                'name' => $request->name,
                'description' => $request->description,
                'color' => $request->color ?? '#6366f1',
                'icon' => $request->icon ?? 'Activity',
                'system' => false,
            ]);

            $workspace->actionTypes()->attach($actionType->id);
        });

        return back()->with('status', 'Action type created and added to workspace.');
    }

    /**
     * Attach an existing system action type to the workspace.
     */
    public function attach(Request $request, $id)
    {
        $actionType = ActionType::findOrFail($id);

        if (!$actionType->system) {
            return back()->withErrors(['action_type' => 'Only system templates can be attached this way.']);
        }

        $workspace = $request->user()->currentWorkspace;
        
        if (!$workspace->actionTypes()->where('action_type_id', $id)->exists()) {
            $workspace->actionTypes()->attach($id);
        }

        return back()->with('status', 'System action template added to workspace.');
    }

    /**
     * Update the specified action type in storage.
     */
    public function update(Request $request, $id)
    {
        $actionType = ActionType::findOrFail($id);

        if ($actionType->system) {
            return back()->withErrors(['action_type' => 'System action templates cannot be edited by users.']);
        }

        $workspace = $request->user()->currentWorkspace;
        // Ensure the action type is owned by this workspace or at least linked to it if we allowed cross-workspace custom actions
        // But for now, custom actions have workspace_id.
        if ($actionType->workspace_id !== $workspace->id) {
             return back()->withErrors(['action_type' => 'Unauthorized action.']);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
        ]);

        $actionType->update($request->only('name', 'description', 'color', 'icon'));

        return back()->with('status', 'Action type updated.');
    }

    /**
     * Remove (detach) the action type from the workspace.
     */
    public function destroy(Request $request, $id)
    {
        $actionType = ActionType::findOrFail($id);
        $workspace = $request->user()->currentWorkspace;

        DB::transaction(function () use ($actionType, $workspace) {
            // Detach from workspace_actions
            $workspace->actionTypes()->detach($actionType->id);

            // If it's a custom action type owned by this workspace, we can delete it 
            // if it's no longer used or just delete it as requested.
            if (!$actionType->system && $actionType->workspace_id === $workspace->id) {
                // Check if it's still linked to other workspaces (shouldn't be for custom ones but good to be safe)
                if ($actionType->workspaceActions()->count() === 0) {
                    $actionType->delete();
                }
            }
        });

        return back()->with('status', 'Action type removed from workspace.');
    }
}
