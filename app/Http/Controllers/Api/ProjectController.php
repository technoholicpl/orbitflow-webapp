<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Http\Resources\ProjectResource;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $workspaceId = $request->user()->current_workspace_id;
        
        $projects = Project::where('workspace_id', $workspaceId)
            ->with(['client', 'brand'])
            ->orderBy('name')
            ->get();

        return ProjectResource::collection($projects);
    }

    public function show(Request $request, Project $project)
    {
        if ($project->workspace_id !== $request->user()->current_workspace_id) {
            return response()->json(['message' => 'Brak uprawnień do tego projektu.'], 403);
        }

        $project->load(['client', 'brand']);
        return new ProjectResource($project);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:active,completed,on_hold',
            'priority' => 'required|string|in:low,medium,high,critical',
            'client_id' => 'nullable|exists:clients,id',
            'brand_id' => 'nullable|exists:brands,id',
        ]);

        $project = Project::create([
            ...$validated,
            'workspace_id' => $request->user()->current_workspace_id,
        ]);

        return new ProjectResource($project);
    }

    public function update(Request $request, Project $project)
    {
        if ($project->workspace_id !== $request->user()->current_workspace_id) {
            return response()->json(['message' => 'Brak uprawnień do edycji tego projektu.'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|string|in:active,completed,on_hold',
            'priority' => 'sometimes|required|string|in:low,medium,high,critical',
            'client_id' => 'nullable|exists:clients,id',
            'brand_id' => 'nullable|exists:brands,id',
        ]);

        $project->update($validated);

        return new ProjectResource($project);
    }
}
