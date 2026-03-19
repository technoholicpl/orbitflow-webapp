<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TimeEntry;
use App\Models\UserCurrentJob;
use App\Http\Resources\TimeEntryResource;
use App\Services\TimeEntryService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TimeEntryController extends Controller
{
    protected $timeEntryService;

    public function __construct(TimeEntryService $timeEntryService)
    {
        $this->timeEntryService = $timeEntryService;
    }

    public function current(Request $request)
    {
        $job = UserCurrentJob::where('user_id', $request->user()->id)
            ->with(['timeEntry.project.brand', 'timeEntry.task'])
            ->first();

        if (!$job) {
            return response()->json(['data' => null]);
        }

        $timeEntry = $job->timeEntry;
        
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

        $timeEntry = $this->timeEntryService->startTimer($request->user(), $validated);

        return new TimeEntryResource($timeEntry);
    }

    public function stop(Request $request)
    {
        $timeEntry = $this->timeEntryService->stopTimer($request->user());

        if (!$timeEntry) {
            return response()->json(['message' => 'Brak aktywnego timera.'], 404);
        }

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

        $timeEntry = $this->timeEntryService->storeManualEntry($request->user(), $validated);

        return new TimeEntryResource($timeEntry);
    }

    public function recovery(Request $request, TimeEntry $timeEntry)
    {
        if ($timeEntry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Brak uprawnień.'], 403);
        }

        $validated = $request->validate([
            'action' => 'required|in:fix_yesterday,manual,delete,ignore',
            'end_time' => 'nullable|string',
        ]);

        $timeEntry = $this->timeEntryService->handleRecovery($request->user(), $timeEntry, $validated);

        if (!$timeEntry) {
            return response()->json(['message' => 'Usunięto pomyślnie.']);
        }

        return new TimeEntryResource($timeEntry);
    }
}
