<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Illuminate\Contracts\Auth\StatefulGuard;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        \Laravel\Fortify\Fortify::ignoreRoutes();

        \Illuminate\Http\Request::macro('isAdmin', function () {
            $prefix = config('cp.prefix', 'admin');
            return $this->is($prefix) || $this->is($prefix . '/*');
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        // Configure Admin Context globally based on prefix
        $request = app('request');
        if ($request->isAdmin()) {
            config(['fortify.guard' => 'admins']);
            config(['fortify.passwords' => 'admins']);
            config(['fortify.home' => '/' . config('cp.prefix', 'admin') . '/dashboard']);

            // Re-bind the guard contract that Fortify uses
            $this->app->bind(StatefulGuard::class, function () {
                return \Illuminate\Support\Facades\Auth::guard('admins');
            });
            
            \Illuminate\Support\Facades\Auth::shouldUse('admins');
        }

        $this->app->make('session')->extend('database', function ($app) {
            $table = $app['config']['session.table'];
            $lifetime = $app['config']['session.lifetime'];
            $connection = $app->get('db')->connection($app['config']['session.connection']);

            return new \App\Session\CustomDatabaseSessionHandler($connection, $table, $lifetime, $app);
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
