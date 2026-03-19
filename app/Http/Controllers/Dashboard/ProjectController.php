<?php

namespace App\Http\Controllers\Dashboard;
use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $workspace = $request->user()->currentWorkspace;

        $projects = Project::where('workspace_id', $workspace->id)
            ->with(['client', 'labels', 'members'])
            ->orderByRaw("status = 'in progress' DESC")
            ->orderBy('created_at', 'DESC')
            ->get();

        return Inertia::render('dashboard/projects/index', [
            'projects' => $projects,
            'clients' => \App\Models\Client::all()
        ]);
    }

    public function kanban(Request $request)
    {
        $projects = Project::where('workspace_id', $request->user()->current_workspace_id)
            ->get()
            ->groupBy('status');

        return Inertia::render('dashboard/projects/kanban', [
            'projectsByStatus' => $projects
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'brand_id' => 'nullable|exists:brands,id',
            'workspace_action_id' => 'nullable|exists:workspace_actions,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,normal,high,urgent',
            'deadline' => 'nullable|date',
            'label_ids' => 'nullable|array',
            'label_ids.*' => 'integer|exists:labels,id',
            'new_labels' => 'nullable|array',
            'new_labels.*' => 'string|max:255',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'exists:users,id',
        ]);

        $project = $request->user()->currentWorkspace->projects()->create($validated);

        // Handle existing labels
        if ($request->filled('label_ids')) {
            $project->labels()->sync($request->label_ids);
        }

        // Handle new labels
        if ($request->filled('new_labels')) {
            foreach ($request->new_labels as $labelName) {
                $label = \App\Models\Label::firstOrCreate(
                    ['name' => $labelName],
                    ['slug' => \Illuminate\Support\Str::slug($labelName)]
                );
                // Associate label with workspace if needed
                $request->user()->currentWorkspace->labels()->syncWithoutDetaching([$label->id]);
                $project->labels()->attach($label->id);
            }
        }

        // Handle members
        if ($request->filled('member_ids')) {
            $project->members()->sync($request->member_ids);
        }

        return redirect()->route('projects.index')->with('message', 'Project created successfully');
    }

    public function show(Project $project)
    {
        $project->load(['client', 'tasks', 'timeEntries']);
        return Inertia::render('projects/show', [
            'project' => $project
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'brand_id' => 'nullable|exists:brands,id',
            'workspace_action_id' => 'nullable|exists:workspace_actions,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,normal,high,urgent',
            'deadline' => 'nullable|date',
            'label_ids' => 'nullable|array',
            'label_ids.*' => 'integer|exists:labels,id',
            'new_labels' => 'nullable|array',
            'new_labels.*' => 'string|max:255',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'exists:users,id',
        ]);

        $project->update($validated);

        // Handle existing labels
        if ($request->has('label_ids')) {
            $project->labels()->sync($request->label_ids);
        }

        // Handle new labels
        if ($request->filled('new_labels')) {
            foreach ($request->new_labels as $labelName) {
                $label = \App\Models\Label::firstOrCreate(
                    ['name' => $labelName],
                    ['slug' => \Illuminate\Support\Str::slug($labelName)]
                );
                $request->user()->currentWorkspace->labels()->syncWithoutDetaching([$label->id]);
                $project->labels()->attach($label->id);
            }
        }

        // Handle members
        if ($request->has('member_ids')) {
            $project->members()->sync($request->member_ids);
        }

        return back()->with('message', 'Project updated successfully');
    }

    public function updateStatus(Request $request, Project $project)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,in progress,pending,completed,archive'
        ]);

        $project->update($validated);
        return back();
    }

    public function getTasks(Project $project)
    {
        return response()->json(
            $project->tasks()->orderBy('name')->get(['id', 'name'])
        );
    }
}
