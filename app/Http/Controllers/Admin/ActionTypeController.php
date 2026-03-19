<?php

namespace App\Http\Controllers\Admin;

use App\Models\ActionType;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActionTypeController extends Controller
{
    /**
     * Display a listing of the system action types.
     */
    public function index()
    {
        $actionTypes = ActionType::where('system', true)
            ->whereNull('workspace_id')
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('admin/settings/action-types/index', [
            'actionTypes' => $actionTypes,
        ]);
    }

    /**
     * Store a newly created system action type in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:action_types,name',
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
        ]);

        ActionType::create([
            'workspace_id' => null,
            'name' => $request->name,
            'description' => $request->description,
            'color' => $request->color ?? '#6366f1',
            'icon' => $request->icon ?? 'Activity',
            'system' => true,
        ]);

        return back()->with('status', 'System action type created.');
    }

    /**
     * Update the specified system action type in storage.
     */
    public function update(Request $request, $id)
    {
        $actionType = ActionType::findOrFail($id);

        if (!$actionType->system) {
             return back()->withErrors(['action_type' => 'Cannot edit non-system actions from here.']);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:action_types,name,' . $id,
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
        ]);

        $actionType->update($request->only('name', 'description', 'color', 'icon'));

        return back()->with('status', 'System action type updated.');
    }

    /**
     * Remove the specified system action type from storage.
     */
    public function destroy($id)
    {
        $actionType = ActionType::findOrFail($id);

        if (!$actionType->system) {
             return back()->withErrors(['action_type' => 'Cannot delete non-system actions from here.']);
        }

        // Warning: This might break workspace_actions if they reference this system type.
        // But system actions are templates, so users usually have their own link to it.
        $actionType->workspaceActions()->delete();
        $actionType->delete();

        return back()->with('status', 'System action type deleted.');
    }
}
