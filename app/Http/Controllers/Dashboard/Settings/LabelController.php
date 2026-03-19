<?php

namespace App\Http\Controllers\Dashboard\Settings;

use App\Models\Label;
use App\Models\Workspace;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class LabelController extends Controller
{
    /**
     * Display a listing of the workspace labels.
     */
    public function index(Request $request)
    {
        $workspace = $request->user()->currentWorkspace;

        $labels = $workspace->labels()
            ->orderBy('name')
            ->get();

        return Inertia::render('dashboard/settings/labels/index', [
            'labels' => $labels,
            'workspaceName' => $workspace->name,
        ]);
    }

    /**
     * Store a newly created label in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:7', // Hex color
        ]);

        $workspace = $request->user()->currentWorkspace;
        $slug = Str::slug($request->name);

        DB::transaction(function () use ($request, $workspace, $slug) {
            // Find or create label by slug (labels can be global, but shared)
            $label = Label::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $request->name,
                    'color' => $request->color ?? '#6366f1',
                ]
            );

            // Attach to workspace if not already attached
            if (!$workspace->labels()->where('label_id', $label->id)->exists()) {
                $workspace->labels()->attach($label);
            }
        });

        return back()->with('status', 'Label created and added to workspace.');
    }

    /**
     * Update the specified label in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:7',
        ]);

        $label = Label::findOrFail($id);
        $slug = Str::slug($request->name);

        $label->update([
            'name' => $request->name,
            'slug' => $slug,
            'color' => $request->color,
        ]);

        return back()->with('status', 'Label updated.');
    }

    /**
     * Remove the specified label from the workspace.
     */
    public function destroy(Request $request, $id)
    {
        $workspace = $request->user()->currentWorkspace;
        $label = Label::findOrFail($id);

        DB::transaction(function () use ($workspace, $label) {
            // Detach from current workspace
            $workspace->labels()->detach($label->id);

            // Check if label is used anywhere else
            $usedInWorkspaces = DB::table('workspace_label')->where('label_id', $label->id)->exists();
            $usedInLabelables = DB::table('labelables')->where('label_id', $label->id)->exists();

            if (!$usedInWorkspaces && !$usedInLabelables) {
                $label->delete();
            }
        });

        return back()->with('status', 'Label removed from workspace.');
    }
}
