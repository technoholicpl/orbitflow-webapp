<?php

use App\Http\Controllers\Dashboard\Account\PasswordController;
use App\Http\Controllers\Dashboard\Account\ProfileController;
use App\Http\Controllers\Dashboard\Account\TwoFactorAuthenticationController;
use App\Http\Controllers\Dashboard\Settings\WorkspaceMemberController;
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


// User/Workspace Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard/dashboard');
    })->name('dashboard');

    // Modules
    Route::get('clients', [\App\Http\Controllers\Dashboard\ClientController::class, 'index'])->name('clients.index');
    Route::get('projects', [\App\Http\Controllers\Dashboard\ProjectController::class, 'index'])->name('projects.index');
    Route::get('projects/kanban', [\App\Http\Controllers\Dashboard\ProjectController::class, 'kanban'])->name('projects.kanban');

    // etc.
});
Route::middleware(['auth'])->group(function () {
    Route::redirect('account', '/account/profile');
    Route::redirect('settings', '/settings/members');

    Route::get('account/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('account/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('account/other-browser-sessions', [ProfileController::class, 'destroyOtherBrowserSessions'])
        ->name('other-browser-sessions.destroy');
    Route::delete('account/browser-session/{sessionId}', [ProfileController::class, 'destroySession'])
        ->name('browser-session.destroy');

    Route::get('settings/members', [WorkspaceMemberController::class, 'index'])->name('workspace.members.index');
    Route::post('settings/members', [WorkspaceMemberController::class, 'store'])->name('workspace.members.store');
    Route::patch('settings/members/{id}', [WorkspaceMemberController::class, 'update'])->name('workspace.members.update');
    Route::delete('settings/members/{id}', [WorkspaceMemberController::class, 'destroy'])->name('workspace.members.destroy');
    Route::patch('settings/members/{id}/permissions', [WorkspaceMemberController::class, 'updatePermissions'])->name('workspace.members.permissions.update');
    Route::get('settings/members/{id}/permissions', [WorkspaceMemberController::class, 'getPermissions'])->name('workspace.members.permissions.get');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('account/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('account/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('account/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('dashboard/settings/appearance', 'dashboard/settings/appearance')->name('appearance.edit');

    Route::get('account/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});

require __DIR__.'/cp.php';
