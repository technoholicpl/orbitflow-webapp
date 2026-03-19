<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\TimeEntry;
use App\Services\TimeEntryService;
use Illuminate\Http\Request;

class TimeEntryController extends Controller
{
    protected $timeEntryService;

    public function __construct(TimeEntryService $timeEntryService)
    {
        $this->timeEntryService = $timeEntryService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'description' => 'nullable|string',
            'started_at' => 'nullable|date',
            'is_manual' => 'boolean'
        ]);

        if ($validated['is_manual'] ?? false) {
            $this->timeEntryService->storeManualEntry($request->user(), $validated);
        } else {
            $this->timeEntryService->startTimer($request->user(), $validated);
        }

        return back();
    }

    public function stop(Request $request, TimeEntry $timeEntry)
    {
        // We use the service to stop the current active timer
        $this->timeEntryService->stopTimer($request->user());

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

        // Map 'duration' to 'duration_minutes' for the service
        $validated['duration_minutes'] = $validated['duration'];

        $this->timeEntryService->storeManualEntry($request->user(), $validated);

        return back()->with('message', 'Time entry added successfully');
    }

    public function recoveryAction(Request $request, TimeEntry $timeEntry)
    {
        $validated = $request->validate([
            'action' => 'required|in:fix_yesterday,manual,delete,ignore',
            'end_time' => 'nullable|string',
        ]);

        // If it's not a full ISO string and contains ':', handle it like HH:mm (old logic preserved)
        if ($validated['end_time'] && !str_contains($validated['end_time'], 'T') && str_contains($validated['end_time'], ':')) {
             $timeParts = explode(':', $validated['end_time']);
             $endedAt = \Carbon\Carbon::parse($timeEntry->started_at)->setTime((int)$timeParts[0], (int)$timeParts[1]);
             if ($endedAt->lt(\Carbon\Carbon::parse($timeEntry->started_at))) {
                 $endedAt->addDay();
             }
             $validated['end_time'] = $endedAt->toIso8601String();
        }

        $this->timeEntryService->handleRecovery($request->user(), $timeEntry, $validated);

        return back();
    }
}
