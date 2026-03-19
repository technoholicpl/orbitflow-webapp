<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => ($request->user() && $request->user() instanceof \App\Models\User) 
                    ? $request->user()->load('workspaces') 
                    : $request->user(),
            ],
            'cp_prefix' => config('cp.prefix', 'admin'),
            'isAdmin' => $request->isAdmin(),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'workspace_clients' => ($request->user() && $request->user()->current_workspace_id)
                ? \App\Models\Client::where('workspace_id', $request->user()->current_workspace_id)
                    ->with('brands')
                    ->get()
                : [],
            'workspace_actions' => ($request->user() && $request->user()->current_workspace_id)
                ? \App\Models\WorkspaceAction::where('workspace_id', $request->user()->current_workspace_id)
                    ->with('actionType')
                    ->get()
                : [],
            'workspace_labels' => ($request->user() && $request->user()->current_workspace_id)
                ? \App\Models\Label::whereHas('workspaces', function($query) use ($request) {
                    $query->where('workspace_id', $request->user()->current_workspace_id);
                })->get()
                : [],
            'workspace_users' => ($request->user() && $request->user()->current_workspace_id)
                ? \App\Models\User::whereHas('workspaces', function($query) use ($request) {
                    $query->where('workspace_id', $request->user()->current_workspace_id);
                })->get()
                : [],
            'workspace_projects' => ($request->user() && $request->user()->current_workspace_id)
                ? \App\Models\Project::where('workspace_id', $request->user()->current_workspace_id)
                    ->orderBy('name')
                    ->get()
                : [],
            'current_timer' => ($request->user())
                ? (function() use ($request) {
                    $timer = \App\Models\TimeEntry::whereHas('currentJob')
                        ->where('user_id', $request->user()->id)
                        ->with(['project.client', 'project.brand', 'task'])
                        ->first();
                    
                    if ($timer) {
                        $timer->needs_recovery = !$timer->recovery_dismissed && ($timer->started_at->diffInHours(\Carbon\Carbon::now('UTC')) >= ($request->user()->timer_hard_timeout ?? 12));
                       // $timer->needs_recovery = !$timer->recovery_dismissed && ($timer->started_at->diffInMinutes(\Carbon\Carbon::now('UTC')) >= 2); // For testing: uncomment this and comment the line above
                    }
                    
                    return $timer;
                })()
                : null,
        ];
    }
}
