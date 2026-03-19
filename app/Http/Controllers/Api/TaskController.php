<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use App\Http\Resources\TaskResource;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request, Project $project)
    {
        if ($project->workspace_id !== $request->user()->current_workspace_id) {
            return response()->json(['message' => 'Brak uprawnień do tego projektu.'], 403);
        }

        $tasks = $project->tasks()->orderBy('created_at', 'desc')->get();
        return TaskResource::collection($tasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:todo,in_progress,completed,on_hold',
            'priority' => 'required|string|in:low,medium,high,critical',
            'due_at' => 'nullable|date',
        ]);

        $project = Project::findOrFail($validated['project_id']);
        if ($project->workspace_id !== $request->user()->current_workspace_id) {
            return response()->json(['message' => 'Brak uprawnień do tego projektu.'], 403);
        }

        $task = Task::create($validated);

        return new TaskResource($task);
    }

    public function update(Request $request, Task $task)
    {
        $project = $task->project;
        if ($project->workspace_id !== $request->user()->current_workspace_id) {
            return response()->json(['message' => 'Brak uprawnień do edycji tego zadania.'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|string|in:todo,in_progress,completed,on_hold',
            'priority' => 'sometimes|required|string|in:low,medium,high,critical',
            'due_at' => 'nullable|date',
        ]);

        $task->update($validated);

        return new TaskResource($task);
    }
}
