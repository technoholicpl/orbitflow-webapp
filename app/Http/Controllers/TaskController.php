<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'name' => 'required|string|max:500',
            'description' => 'nullable|string',
            'estimated_time' => 'nullable|integer',
        ]);

        $task = Task::create([
            'workspace_id' => $request->user()->current_workspace_id,
            'project_id' => $validated['project_id'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'estimated_time' => $validated['estimated_time'],
        ]);

        return back();
    }

    public function toggleDone(Request $request, Task $task)
    {
        $task->update([
            'done_at' => $task->done_at ? null : now()
        ]);

        return back();
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return back();
    }
}
