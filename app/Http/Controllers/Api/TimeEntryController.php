<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TimeEntry;
use App\Models\UserCurrentJob;
use App\Http\Resources\TimeEntryResource;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TimeEntryController extends Controller
{
    public function current(Request $request)
    {
        $job = UserCurrentJob::where('user_id', $request->user()->id)
            ->with(['timeEntry.project.brand', 'timeEntry.task'])
            ->first();

        if (!$job) {
            return response()->json(['data' => null]);
        }

        $timeEntry = $job->timeEntry;
        
        // Add needs_recovery flag similar to web middleware
        $hardTimeout = $request->user()->timer_hard_timeout ?? 12;
        $timeEntry->needs_recovery = !$timeEntry->recovery_dismissed && 
            ($timeEntry->started_at->diffInHours(Carbon::now('UTC')) >= $hardTimeout);

        return new TimeEntryResource($timeEntry);
    }

    public function start(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'description' => 'nullable|string',
        ]);

        // Stop existing timer if any
        UserCurrentJob::where('user_id', $request->user()->id)->delete();

        $timeEntry = TimeEntry::create([
            'user_id' => $request->user()->id,
            'workspace_id' => $request->user()->current_workspace_id,
            'project_id' => $validated['project_id'],
            'task_id' => $validated['task_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'started_at' => Carbon::now('UTC'),
            'is_manual' => false,
        ]);

        UserCurrentJob::create([
            'user_id' => $request->user()->id,
            'time_entry_id' => $timeEntry->id,
        ]);

        return new TimeEntryResource($timeEntry);
    }

    public function stop(Request $request)
    {
        $job = UserCurrentJob::where('user_id', $request->user()->id)->first();

        if (!$job) {
            return response()->json(['message' => 'Brak aktywnego timera.'], 404);
        }

        $timeEntry = $job->timeEntry;
        $now = Carbon::now('UTC');
        $duration = max(0, $now->timestamp - $timeEntry->started_at->timestamp);

        $timeEntry->update([
            'ended_at' => $now,
            'duration' => $duration,
        ]);

        $job->delete();

        // Update project spent time
        $this->updateProjectSpentTime($timeEntry->project_id);

        return new TimeEntryResource($timeEntry);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'description' => 'nullable|string',
            'started_at' => 'required|date',
            'ended_at' => 'required|date|after:started_at',
        ]);

        $start = Carbon::parse($validated['started_at']);
        $end = Carbon::parse($validated['ended_at']);
        $duration = $end->timestamp - $start->timestamp;

        $timeEntry = TimeEntry::create([
            'user_id' => $request->user()->id,
            'workspace_id' => $request->user()->current_workspace_id,
            'project_id' => $validated['project_id'],
            'task_id' => $validated['task_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'started_at' => $start,
            'ended_at' => $end,
            'duration' => $duration,
            'is_manual' => true,
        ]);

        $this->updateProjectSpentTime($timeEntry->project_id);

        return new TimeEntryResource($timeEntry);
    }

    public function recovery(Request $request, TimeEntry $timeEntry)
    {
        if ($timeEntry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Brak uprawnień.'], 403);
        }

        $validated = $request->validate([
            'action' => 'required|in:fix_yesterday,manual,delete,ignore',
            'end_time' => 'nullable|string', // ISO string suggested
        ]);

        switch ($validated['action']) {
            case 'fix_yesterday':
                $remindEvery = $request->user()->timer_remind_every ?? 8;
                $endedAt = Carbon::parse($timeEntry->started_at)->addHours($remindEvery);
                $duration = $remindEvery * 3600;
                $timeEntry->update(['ended_at' => $endedAt, 'duration' => $duration]);
                UserCurrentJob::where('time_entry_id', $timeEntry->id)->delete();
                break;

            case 'manual':
                if (!$validated['end_time']) return response()->json(['message' => 'Czas zakończenia jest wymagany.'], 422);
                $endedAt = Carbon::parse($validated['end_time'], 'UTC');
                $duration = max(0, $endedAt->timestamp - $timeEntry->started_at->timestamp);
                $timeEntry->update(['ended_at' => $endedAt, 'duration' => $duration]);
                UserCurrentJob::where('time_entry_id', $timeEntry->id)->delete();
                break;

            case 'delete':
                UserCurrentJob::where('time_entry_id', $timeEntry->id)->delete();
                $timeEntry->delete();
                return response()->json(['message' => 'Usunięto pomyślnie.']);

            case 'ignore':
                $timeEntry->update(['recovery_dismissed' => true]);
                break;
        }

        $this->updateProjectSpentTime($timeEntry->project_id);

        return new TimeEntryResource($timeEntry);
    }

    protected function updateProjectSpentTime($projectId)
    {
        $totalSeconds = TimeEntry::where('project_id', $projectId)->sum('duration');
        \App\Models\Project::where('id', $projectId)->update(['spent_time' => (int)$totalSeconds]);
    }
}
