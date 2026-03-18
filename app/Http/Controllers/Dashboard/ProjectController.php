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
            ->with(['client'])
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
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,normal,high,urgent',
            'deadline' => 'nullable|date',
        ]);

        $request->user()->currentWorkspace->projects()->create($validated);

        return redirect()->route('projects.index');
    }

    public function show(Project $project)
    {
        $project->load(['client', 'tasks', 'timeEntries']);
        return Inertia::render('projects/show', [
            'project' => $project
        ]);
    }

    public function updateStatus(Request $request, Project $project)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,in progress,pending,completed,archive'
        ]);

        $project->update($validated);

        return back();
    }
}
