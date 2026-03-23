<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProjectTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ProjectTemplateController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/settings/templates/index', [
            'templates' => ProjectTemplate::whereNull('workspace_id')->get(),
        ]);
    }

    public function store(Request $request)
    {
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
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'icon' => $validated['icon'],
            'tasks' => $validated['tasks'],
            'workspace_id' => null, // System template
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'System template created successfully.');
    }

    public function update(Request $request, ProjectTemplate $template)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'required|string',
            'tasks' => 'required|array',
            'tasks.*.name' => 'required|string',
            'tasks.*.status' => 'required|string',
            'is_active' => 'required|boolean',
        ]);

        $template->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'icon' => $validated['icon'],
            'tasks' => $validated['tasks'],
            'is_active' => $validated['is_active'],
        ]);

        return redirect()->back()->with('success', 'System template updated successfully.');
    }

    public function destroy(ProjectTemplate $template)
    {
        if ($template->workspace_id !== null) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete workspace-specific templates from the admin panel.']);
        }

        $template->delete();
        return redirect()->back()->with('success', 'System template deleted successfully.');
    }
}
