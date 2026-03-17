<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use Laravel\Fortify\Fortify;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ])->rootView('frontend');
})->name('home');

Route::get('/debug-prefix', function (\Illuminate\Http\Request $request) {
    return [
        'url' => $request->fullUrl(),
        'isAdmin' => $request->isAdmin(),
        'cp_prefix' => config('cp.prefix'),
        'fortify_guard' => config('fortify.guard'),
    ];
});

// Fortify Routes for Users
Route::middleware(['web'])->group(function () {
    require base_path('vendor/laravel/fortify/routes/routes.php');
});

// Fortify Routes for Admins
$adminPrefix = config('cp.prefix', 'admin');
Route::middleware(['web'])
    ->prefix($adminPrefix)
    ->name('admin.')
    ->group(function () {
        // Change guard during registration to ensure routes use guest:admins and auth:admins
        $originalGuard = config('fortify.guard');
        $originalPasswords = config('fortify.passwords');
        
        config(['fortify.guard' => 'admins']);
        config(['fortify.passwords' => 'admins']);
        
        require base_path('vendor/laravel/fortify/routes/routes.php');
        
        config(['fortify.guard' => $originalGuard]);
        config(['fortify.passwords' => $originalPasswords]);
        
        // Overwrite the password confirmation route specifically for admins
        Route::post('/user/confirm-password', [\App\Http\Controllers\Admin\Auth\ConfirmablePasswordController::class, 'store'])
            ->name('password.confirm');

        Route::get('/debug-admin', function (\Illuminate\Http\Request $request) {
            return [
                'url' => $request->fullUrl(),
                'isAdmin' => $request->isAdmin(),
                'cp_prefix' => config('cp.prefix'),
                'fortify_guard' => config('fortify.guard'),
            ];
        });
    });

// Admin Routes
$adminPrefix = config('cp.prefix', 'admin');
Route::prefix($adminPrefix)->name('admin.')->group(function () {
    Route::middleware(['auth:admins'])->group(function () {
        Route::inertia('dashboard', 'admin/dashboard')->name('dashboard');
        
        // Admin Settings Routes
        Route::get('settings/profile', [\App\Http\Controllers\Admin\Settings\ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('settings/profile', [\App\Http\Controllers\Admin\Settings\ProfileController::class, 'update'])->name('profile.update');
        Route::delete('settings/other-browser-sessions', [\App\Http\Controllers\Admin\Settings\ProfileController::class, 'destroyOtherBrowserSessions'])
            ->name('other-browser-sessions.destroy');
        Route::delete('settings/browser-session/{sessionId}', [\App\Http\Controllers\Admin\Settings\ProfileController::class, 'destroySession'])
            ->name('browser-session.destroy');
        
        Route::get('settings/password', [\App\Http\Controllers\Admin\Settings\PasswordController::class, 'edit'])->name('user-password.edit');
        Route::put('settings/password', [\App\Http\Controllers\Admin\Settings\PasswordController::class, 'update'])
            ->middleware('throttle:6,1')
            ->name('user-password.update');
            
        Route::inertia('settings/appearance', 'admin/settings/appearance')->name('appearance.edit');
        
        Route::get('settings/two-factor', [\App\Http\Controllers\Admin\Settings\TwoFactorAuthenticationController::class, 'show'])
            ->name('two-factor.show');

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
