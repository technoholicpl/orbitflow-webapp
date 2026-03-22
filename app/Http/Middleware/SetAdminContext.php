<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Contracts\Auth\StatefulGuard;
use Symfony\Component\HttpFoundation\Response;

class SetAdminContext
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isAdmin()) {
            config(['fortify.guard' => 'admins']);
            config(['fortify.passwords' => 'admins']);
            config(['fortify.home' => '/' . config('cp.prefix', 'admin') . '/dashboard']);

            // Re-bind the guard contract that Fortify uses
            app()->bind(StatefulGuard::class, function () {
                return Auth::guard('admins');
            });
            
            Auth::shouldUse('admins');
        }

        return $next($request);
    }
}
