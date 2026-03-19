<?php

namespace App\Http\Controllers\Dashboard;
use App\Http\Controllers\Controller;
use App\Models\TimeEntry;
use App\Models\Project;
use App\Models\Task;
use App\Models\UserCurrentJob;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TimeEntryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'description' => 'nullable|string',
            'started_at' => 'nullable|date',
            'is_manual' => 'boolean'
        ]);

        $startedAt = ($validated['is_manual'] ?? false) 
            ? Carbon::parse($validated['started_at'])->utc() 
            : Carbon::now('UTC');

        // Stop any currently running timer for this user
        UserCurrentJob::where('user_id', $request->user()->id)->get()->each(function ($currentJob) {
            $entry = $currentJob->timeEntry;
            if ($entry) {
                $endedAt = Carbon::now('UTC');
                // Robust calculation: compare raw strings to avoid timezone mismatch if DB session is not yet UTC
                $duration = abs(strtotime($endedAt->toDateTimeString()) - strtotime($entry->started_at->toDateTimeString()));
                
                $entry->update([
                    'ended_at' => $endedAt,
                    'duration' => $duration
                ]);
                $this->recalculateSpentTime($entry->project_id, $entry->task_id);
            }
            $currentJob->delete();
        });

        $entry = TimeEntry::create([
            'workspace_id' => $request->user()->current_workspace_id,
            'project_id' => $validated['project_id'],
            'task_id' => $validated['task_id'] ?? null,
            'user_id' => $request->user()->id,
            'description' => $validated['description'] ?? null,
            'started_at' => $startedAt,
            'is_manual' => $validated['is_manual'] ?? false,
        ]);

        UserCurrentJob::create([
            'user_id' => $request->user()->id,
            'project_id' => $validated['project_id'],
            'task_id' => $validated['task_id'] ?? null,
            'time_entry_id' => $entry->id,
        ]);

        $project = Project::find($validated['project_id']);
        if ($project && $project->status === 'new') {
            $project->update(['status' => 'in progress']);
        }

        return back();
    }

    public function stop(Request $request, TimeEntry $timeEntry)
    {
        $endedAt = Carbon::now('UTC');
        // Robust calculation: compare raw strings to avoid timezone mismatch if DB session is not yet UTC
        $duration = abs(strtotime($endedAt->toDateTimeString()) - strtotime($timeEntry->started_at->toDateTimeString()));

        $timeEntry->update([
            'ended_at' => $endedAt,
            'duration' => $duration
        ]);

        UserCurrentJob::where('time_entry_id', $timeEntry->id)->delete();

        $this->recalculateSpentTime($timeEntry->project_id, $timeEntry->task_id);

        return back();
    }

    public function manualStore(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'description' => 'nullable|string',
            'started_at' => 'required|date',
            'duration' => 'required|integer|min:1', // in minutes
        ]);

        $workspaceId = $request->user()->current_workspace_id;

        $entry = TimeEntry::create([
            'workspace_id' => $workspaceId,
            'project_id' => $validated['project_id'],
            'task_id' => $validated['task_id'] ?? null,
            'user_id' => $request->user()->id,
            'description' => $validated['description'] ?? null,
            'started_at' => Carbon::parse($validated['started_at'])->utc(),
            'ended_at' => Carbon::parse($validated['started_at'])->utc()->addMinutes($validated['duration']),
            'duration' => $validated['duration'] * 60, // store in seconds
            'is_manual' => true,
        ]);

        $this->recalculateSpentTime($validated['project_id'], $validated['task_id'] ?? null);

        return back()->with('message', 'Time entry added successfully');
    }

    protected function recalculateSpentTime($projectId, $taskId = null)
    {
        // Update Project
        $projectTotalSeconds = TimeEntry::where('project_id', $projectId)->sum('duration');
        Project::where('id', $projectId)->update([
            'spent_time' => (int)$projectTotalSeconds
        ]);

        // Update Task if applicable
        if ($taskId) {
            $taskTotalSeconds = TimeEntry::where('task_id', $taskId)->sum('duration');
            Task::where('id', $taskId)->update([
                'spent_time' => (int)$taskTotalSeconds
            ]);
        }
    }
}
