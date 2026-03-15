<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use Laravel\Fortify\Fortify;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Fortify Routes for Users
Route::middleware(['web'])->group(function () {
    require base_path('vendor/laravel/fortify/routes/routes.php');
});

// Fortify Routes for Admins
$adminPrefix = config('cp.prefix', 'admin');
Route::middleware(['web', \App\Http\Middleware\ConfigureFortifyForAdmin::class])
    ->prefix($adminPrefix)
    ->name('admin.')
    ->group(function () {
        require base_path('vendor/laravel/fortify/routes/routes.php');
    });

// Admin Routes
$adminPrefix = config('cp.prefix', 'admin');
Route::prefix($adminPrefix)->name('admin.')->group(function () {
    Route::middleware(['auth:admins'])->group(function () {
        Route::inertia('dashboard', 'admin/dashboard')->name('dashboard');
        Route::get('users', function () {
            return Inertia::render('admin/users', [
                'users' => \App\Models\User::all()
            ]);
        })->name('users');
        Route::get('subscriptions', function () {
            return Inertia::render('admin/subscriptions');
        })->name('subscriptions');
        // CMS, etc.
    });
});

// User/Workspace Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Modules
    Route::get('clients', [\App\Http\Controllers\ClientController::class, 'index'])->name('clients.index');
    Route::get('projects', [\App\Http\Controllers\ProjectController::class, 'index'])->name('projects.index');
    Route::get('projects/kanban', [\App\Http\Controllers\ProjectController::class, 'kanban'])->name('projects.kanban');
    
    // etc.
});

require __DIR__.'/settings.php';
