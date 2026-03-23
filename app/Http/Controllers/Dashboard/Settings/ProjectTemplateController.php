<?php

namespace App\Http\Controllers\Dashboard\Settings;

use App\Http\Controllers\Controller;
use App\Models\ProjectTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ProjectTemplateController extends Controller
{
    public function index(Request $request)
    {
        $workspace = $request->user()->currentWorkspace;

        return Inertia::render('dashboard/settings/templates/index', [
            'systemTemplates' => ProjectTemplate::whereNull('workspace_id')->where('is_active', true)->get(),
            'customTemplates' => ProjectTemplate::where('workspace_id', $workspace->id)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $workspace = $request->user()->currentWorkspace;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'required|string',
            'tasks' => 'required|array',
            'tasks.*.name' => 'required|string',
            'tasks.*.status' => 'required|string',
        ]);

        ProjectTemplate::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::random(5),
            'description' => $validated['description'],
            'icon' => $validated['icon'],
            'tasks' => $validated['tasks'],
            'workspace_id' => $workspace->id,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Custom template created successfully.');
    }

    public function update(Request $request, ProjectTemplate $template)
    {
        $workspace = $request->user()->currentWorkspace;

        if ($template->workspace_id !== $workspace->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'required|string',
            'tasks' => 'required|array',
            'tasks.*.name' => 'required|string',
            'tasks.*.status' => 'required|string',
        ]);

        $template->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::random(5),
            'description' => $validated['description'],
            'icon' => $validated['icon'],
            'tasks' => $validated['tasks'],
        ]);

        return redirect()->back()->with('success', 'Custom template updated successfully.');
    }

    public function destroy(Request $request, ProjectTemplate $template)
    {
        $workspace = $request->user()->currentWorkspace;

        if ($template->workspace_id !== $workspace->id) {
            abort(403);
        }

        $template->delete();
        return redirect()->back()->with('success', 'Custom template deleted successfully.');
    }

    public function clone(Request $request, ProjectTemplate $template)
    {
        $workspace = $request->user()->currentWorkspace;

        // Ensure we are cloning a system template
        if ($template->workspace_id !== null) {
            abort(403);
        }

        ProjectTemplate::create([
            'name' => $template->name . ' (Kopia)',
            'slug' => $template->slug . '-' . Str::random(5),
            'description' => $template->description,
            'icon' => $template->icon,
            'tasks' => $template->tasks,
            'workspace_id' => $workspace->id,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'System template activated/cloned to your workspace.');
    }
}
