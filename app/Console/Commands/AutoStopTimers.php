<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class AutoStopTimers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:auto-stop-timers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically stops timers that exceed hard timeouts or end-of-day cutoffs.';
    protected $recalculatableProjects = [];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $activeEntries = \App\Models\TimeEntry::whereNull('ended_at')
            ->whereHas('currentJob')
            ->with('user')
            ->get();

        foreach ($activeEntries as $entry) {
            $user = $entry->user;
            if (!$user) continue;

            $now = \Carbon\Carbon::now('UTC');
            $startedAt = \Carbon\Carbon::parse($entry->started_at);

            // 1. Hard Timeout (default 12h)
            $hardTimeoutHours = $user->timer_hard_timeout ?? 12;
            if ($startedAt->diffInHours($now) >= $hardTimeoutHours) {
                $this->stopTimer($entry, $startedAt->copy()->addHours($hardTimeoutHours), "Hard timeout ({$hardTimeoutHours}h) reached");
                continue;
            }

            // 2. End-of-day Cutoff (user setting)
            if ($user->timer_auto_stop_at) {
                // Parse cutoff as UTC for direct comparison
                $cutoffTime = \Carbon\Carbon::today('UTC')->setTimeFromTimeString($user->timer_auto_stop_at);
                
                if ($now->greaterThan($cutoffTime) && $startedAt->lessThan($cutoffTime)) {
                     $this->stopTimer($entry, $cutoffTime, "End-of-day cutoff ({$user->timer_auto_stop_at}) reached");
                     continue;
                }
            }

            // 3. Reminder (default 8h)
            $remindEveryHours = $user->timer_remind_every ?? 8;
            $lastRemindedAt = $entry->last_reminded_at ? \Carbon\Carbon::parse($entry->last_reminded_at) : null;
            
            if ($startedAt->diffInHours($now) >= $remindEveryHours) {
                // Remind if never reminded, or if enough time passed since last reminder
                if (!$lastRemindedAt || $lastRemindedAt->diffInHours($now) >= $remindEveryHours) {
                    $user->notify(new \App\Notifications\TimerRunningReminder($entry));
                    $entry->update(['last_reminded_at' => $now]);
                }
            }
        }

        // Recalculate spent time for affected projects
        foreach (array_unique($this->recalculatableProjects) as $projectId) {
            $this->recalculateSpentTime($projectId);
        }
    }

    protected function stopTimer($entry, $endedAt, $reason)
    {
        $duration = abs(strtotime($endedAt->toDateTimeString()) - strtotime(\Carbon\Carbon::parse($entry->started_at)->toDateTimeString()));
        
        $entry->update([
            'ended_at' => $endedAt,
            'duration' => $duration,
            'description' => $entry->description ? $entry->description . " (Auto-stopped: $reason)" : "(Auto-stopped: $reason)"
        ]);

        \App\Models\UserCurrentJob::where('time_entry_id', $entry->id)->delete();
        
        $this->recalculatableProjects[] = $entry->project_id;
        $this->info("Stopped timer {$entry->id} for user {$entry->user->name}. Reason: $reason");
    }

    protected function recalculateSpentTime($projectId)
    {
        $totalSeconds = \App\Models\TimeEntry::where('project_id', $projectId)->sum('duration');
        \App\Models\Project::where('id', $projectId)->update([
            'spent_time' => (int)$totalSeconds
        ]);
    }
}
