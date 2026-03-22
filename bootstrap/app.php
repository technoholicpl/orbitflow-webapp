<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            \App\Http\Middleware\HandlePendingInvitation::class,
            \App\Http\Middleware\SetCurrentWorkspace::class,
            HandleInertiaRequests::class,
            \App\Http\Middleware\SetAdminContext::class,
            \App\Http\Middleware\EnsureHasWorkspace::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->redirectTo(
            guests: function ($request) {
                // Admin Context is now handled via SetAdminContext middleware
                if ($request->isAdmin()) {
                    return route('admin.login');
                }
                return route('login');
            },
            users: function ($request) {
                if ($request->isAdmin()) {
                    return '/' . config('cp.prefix', 'admin') . '/dashboard';
                }
                return config('fortify.home', '/dashboard');
            }
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
