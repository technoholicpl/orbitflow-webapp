<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ConfigureFortifyForAdmin
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
            $guard = \Illuminate\Support\Facades\Auth::guard('admins');
            
            app()->instance('Laravel\Fortify\Contracts\StatefulGuard', $guard);
            app()->instance(\Illuminate\Contracts\Auth\StatefulGuard::class, $guard);
            
            \Illuminate\Support\Facades\Auth::shouldUse('admins');
        }

        return $next($request);
    }
}
