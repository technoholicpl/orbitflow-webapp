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
        /** ? Carbon::parse($validated['started_at']) 
            : Carbon::now();
        */
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

    public function recoveryAction(Request $request, TimeEntry $timeEntry)
    {
        $validated = $request->validate([
            'action' => 'required|in:fix_yesterday,manual,delete,ignore',
            'end_time' => 'nullable|string', // HH:mm
        ]);

        switch ($validated['action']) {
            case 'fix_yesterday':
                // Set to user's reminder interval after start as a safe default
                $remindEvery = $request->user()->timer_remind_every ?? 8;
                $endedAt = Carbon::parse($timeEntry->started_at)->addHours($remindEvery);
                $duration = $remindEvery * 3600;
                $timeEntry->update([
                    'ended_at' => $endedAt,
                    'duration' => $duration
                ]);
                UserCurrentJob::where('time_entry_id', $timeEntry->id)->delete();
                break;

            case 'manual':
                if (!$validated['end_time']) return back();
                
                // If it's a full ISO string from frontend, parse it directly to UTC
                if (str_contains($validated['end_time'], 'T')) {
                    $endedAt = Carbon::parse($validated['end_time'])->utc();
                } else {
                    // Fallback for HH:mm string
                    $timeParts = explode(':', $validated['end_time']);
                    $endedAt = Carbon::parse($timeEntry->started_at)->setTime((int)$timeParts[0], (int)$timeParts[1]);
                    
                    // If endedAt is before startedAt, it likely means it ended the next day
                    if ($endedAt->lt(Carbon::parse($timeEntry->started_at))) {
                        $endedAt->addDay();
                    }
                }
                
                $duration = abs(strtotime($endedAt->toDateTimeString()) - strtotime(Carbon::parse($timeEntry->started_at)->toDateTimeString()));
                $timeEntry->update([
                    'ended_at' => $endedAt,
                    'duration' => $duration
                ]);
                UserCurrentJob::where('time_entry_id', $timeEntry->id)->delete();
                break;

            case 'delete':
                UserCurrentJob::where('time_entry_id', $timeEntry->id)->delete();
                $timeEntry->delete();
                break;

            case 'ignore':
                $timeEntry->update(['recovery_dismissed' => true]);
                break;
        }

        $this->recalculateSpentTime($timeEntry->project_id, $timeEntry->task_id);

        return back();
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
