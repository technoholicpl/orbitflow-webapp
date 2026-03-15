<?php

namespace App\Http\Controllers;

use App\Models\TimeEntry;
use App\Models\Project;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TimeEntryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'description' => 'nullable|string',
            'started_at' => 'required|date',
            'is_manual' => 'boolean'
        ]);

        $entry = TimeEntry::create([
            'workspace_id' => $request->user()->current_workspace_id,
            'project_id' => $validated['project_id'],
            'user_id' => $request->user()->id,
            'description' => $validated['description'] ?? null,
            'started_at' => $validated['started_at'],
            'is_manual' => $validated['is_manual'] ?? false,
        ]);

        // If it's a real-time timer starting, maybe update project status
        $project = Project::find($validated['project_id']);
        if ($project && $project->status === 'new') {
            $project->update(['status' => 'in progress']);
        }

        return back();
    }

    public function stop(Request $request, TimeEntry $timeEntry)
    {
        $endedAt = Carbon::now();
        $duration = $endedAt->diffInSeconds($timeEntry->started_at);

        $timeEntry->update([
            'ended_at' => $endedAt,
            'duration' => $duration
        ]);

        return back();
    }

    public function manualStore(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'description' => 'required|string',
            'started_at' => 'required|date',
            'duration' => 'required|integer', // in minutes
        ]);

        TimeEntry::create([
            'workspace_id' => $request->user()->current_workspace_id,
            'project_id' => $validated['project_id'],
            'user_id' => $request->user()->id,
            'description' => $validated['description'],
            'started_at' => $validated['started_at'],
            'ended_at' => Carbon::parse($validated['started_at'])->addMinutes($validated['duration']),
            'duration' => $validated['duration'] * 60,
            'is_manual' => true,
        ]);

        return back();
    }
}
