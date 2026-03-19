<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\TimeEntryService;
use App\Models\TimeEntry;
use Carbon\Carbon;

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

    /**
     * Execute the console command.
     */
    public function handle(TimeEntryService $timeEntryService)
    {
        $activeEntries = TimeEntry::whereNull('ended_at')
            ->whereHas('currentJob')
            ->with('user')
            ->get();

        foreach ($activeEntries as $entry) {
            $user = $entry->user;
            if (!$user) continue;

            $now = Carbon::now('UTC');
            $startedAt = Carbon::parse($entry->started_at);

            // 1. Hard Timeout (default 12h)
            $hardTimeoutHours = $user->timer_hard_timeout ?? 12;
            if ($startedAt->diffInHours($now) >= $hardTimeoutHours) {
                $timeEntryService->stopTimer($user, $startedAt->copy()->addHours($hardTimeoutHours), "Hard timeout ({$hardTimeoutHours}h) reached");
                $this->info("Stopped timer {$entry->id} for user {$user->name}. Reason: Hard timeout");
                continue;
            }

            // 2. End-of-day Cutoff (user setting)
            if ($user->timer_auto_stop_at) {
                $cutoffTime = Carbon::today('UTC')->setTimeFromTimeString($user->timer_auto_stop_at);
                
                if ($now->greaterThan($cutoffTime) && $startedAt->lessThan($cutoffTime)) {
                     $timeEntryService->stopTimer($user, $cutoffTime, "End-of-day cutoff ({$user->timer_auto_stop_at}) reached");
                     $this->info("Stopped timer {$entry->id} for user {$user->name}. Reason: End-of-day cutoff");
                     continue;
                }
            }

            // 3. Reminder (default 8h)
            $remindEveryHours = $user->timer_remind_every ?? 8;
            $lastRemindedAt = $entry->last_reminded_at ? Carbon::parse($entry->last_reminded_at) : null;
            
            if ($startedAt->diffInHours($now) >= $remindEveryHours) {
                if (!$lastRemindedAt || $lastRemindedAt->diffInHours($now) >= $remindEveryHours) {
                    $user->notify(new \App\Notifications\TimerRunningReminder($entry));
                    $entry->update(['last_reminded_at' => $now]);
                }
            }
        }
    }
}
