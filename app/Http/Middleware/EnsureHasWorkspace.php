<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasWorkspace
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->email_verified_at && !$user->current_workspace_id) {
            if (!$request->is('onboarding*') && !$request->is('logout') && !$request->is('api*')) {
                return redirect()->route('onboarding.index');
            }
        }

        return $next($request);
    }
}
