<?php

namespace App\Services;

use App\Models\TimeEntry;
use App\Models\UserCurrentJob;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TimeEntryService
{
    /**
     * Start a new timer for the given user.
     */
    public function startTimer(User $user, array $data): TimeEntry
    {
        return DB::transaction(function () use ($user, $data) {
            // Stop existing timer if any
            UserCurrentJob::where('user_id', $user->id)->delete();

            $timeEntry = TimeEntry::create([
                'user_id' => $user->id,
                'workspace_id' => $user->current_workspace_id,
                'project_id' => $data['project_id'],
                'task_id' => $data['task_id'] ?? null,
                'description' => $data['description'] ?? null,
                'started_at' => Carbon::now('UTC'),
                'is_manual' => false,
            ]);

            UserCurrentJob::create([
                'user_id' => $user->id,
                'project_id' => $data['project_id'],
                'task_id' => $data['task_id'] ?? null,
                'time_entry_id' => $timeEntry->id,
            ]);

            // Update project status if it's new
            $project = Project::find($data['project_id']);
            if ($project && $project->status === 'new') {
                $project->update(['status' => 'in progress']);
            }

            return $timeEntry;
        });
    }

    /**
     * Stop the currently running timer for the given user.
     */
    public function stopTimer(User $user, ?Carbon $endedAt = null, ?string $reason = null): ?TimeEntry
    {
        return DB::transaction(function () use ($user, $endedAt, $reason) {
            $job = UserCurrentJob::where('user_id', $user->id)->first();

            if (!$job) {
                return null;
            }

            $timeEntry = $job->timeEntry;
            $endedAt = $endedAt ?? Carbon::now('UTC');
            $duration = max(0, $endedAt->timestamp - $timeEntry->started_at->timestamp);

            $updateData = [
                'ended_at' => $endedAt,
                'duration' => $duration,
            ];

            if ($reason) {
                $updateData['description'] = $timeEntry->description 
                    ? $timeEntry->description . " (Auto-stopped: $reason)" 
                    : "(Auto-stopped: $reason)";
            }

            $timeEntry->update($updateData);

            $job->delete();

            $this->updateProjectSpentTime($timeEntry->project_id, $timeEntry->task_id);

            return $timeEntry;
        });
    }

    /**
     * Store a manual time entry.
     */
    public function storeManualEntry(User $user, array $data): TimeEntry
    {
        return DB::transaction(function () use ($user, $data) {
            $start = Carbon::parse($data['started_at'])->utc();
            $duration = isset($data['duration_minutes']) 
                ? $data['duration_minutes'] * 60 
                : (Carbon::parse($data['ended_at'])->timestamp - $start->timestamp);

            $end = isset($data['ended_at']) 
                ? Carbon::parse($data['ended_at'])->utc()
                : $start->copy()->addSeconds($duration);

            $timeEntry = TimeEntry::create([
                'user_id' => $user->id,
                'workspace_id' => $user->current_workspace_id,
                'project_id' => $data['project_id'],
                'task_id' => $data['task_id'] ?? null,
                'description' => $data['description'] ?? null,
                'started_at' => $start,
                'ended_at' => $end,
                'duration' => max(0, $duration),
                'is_manual' => true,
            ]);

            $this->updateProjectSpentTime($timeEntry->project_id, $timeEntry->task_id);

            return $timeEntry;
        });
    }

    /**
     * Handle recovery actions for a long-running timer.
     */
    public function handleRecovery(User $user, TimeEntry $timeEntry, array $data): ?TimeEntry
    {
        return DB::transaction(function () use ($user, $timeEntry, $data) {
            switch ($data['action']) {
                case 'fix_yesterday':
                    $remindEvery = $user->timer_remind_every ?? 8;
                    $endedAt = Carbon::parse($timeEntry->started_at)->addHours($remindEvery);
                    $duration = $remindEvery * 3600;
                    $timeEntry->update(['ended_at' => $endedAt, 'duration' => $duration]);
                    UserCurrentJob::where('time_entry_id', $timeEntry->id)->delete();
                    break;

                case 'manual':
                    $endedAt = Carbon::parse($data['end_time'])->utc();
                    $duration = max(0, $endedAt->timestamp - $timeEntry->started_at->timestamp);
                    $timeEntry->update(['ended_at' => $endedAt, 'duration' => $duration]);
                    UserCurrentJob::where('time_entry_id', $timeEntry->id)->delete();
                    break;

                case 'delete':
                    UserCurrentJob::where('time_entry_id', $timeEntry->id)->delete();
                    $timeEntry->delete();
                    return null;

                case 'ignore':
                    $timeEntry->update(['recovery_dismissed' => true]);
                    break;
            }

            $this->updateProjectSpentTime($timeEntry->project_id, $timeEntry->task_id);

            return $timeEntry;
        });
    }

    /**
     * Update the total spent time for a project and optionally a task.
     */
    public function updateProjectSpentTime(int $projectId, ?int $taskId = null): void
    {
        // Update Project
        $projectTotalSeconds = TimeEntry::where('project_id', $projectId)->sum('duration');
        Project::where('id', $projectId)->update(['spent_time' => (int)$projectTotalSeconds]);

        // Update Task if applicable
        if ($taskId) {
            $taskTotalSeconds = TimeEntry::where('task_id', $taskId)->sum('duration');
            \App\Models\Task::where('id', $taskId)->update(['spent_time' => (int)$taskTotalSeconds]);
        }
    }
}
