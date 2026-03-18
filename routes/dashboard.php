<?php

use App\Http\Controllers\Dashboard\Account\PasswordController;
use App\Http\Controllers\Dashboard\Account\ProfileController;
use App\Http\Controllers\Dashboard\Account\TwoFactorAuthenticationController;
use App\Http\Controllers\Dashboard\Settings\WorkspaceMemberController;
use App\Http\Controllers\Dashboard\ClientController;
use App\Http\Controllers\Dashboard\ProjectController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard/dashboard');
    })->name('dashboard');

    // Modules
    Route::get('clients', [ClientController::class, 'index'])->name('clients.index');
    Route::post('clients', [ClientController::class, 'store'])->name('clients.store');
    Route::get('projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('projects/kanban', [ProjectController::class, 'kanban'])->name('projects.kanban');

    // Appearance
    Route::inertia('dashboard/settings/appearance', 'dashboard/settings/appearance')->name('appearance.edit');
});

Route::middleware(['auth'])->group(function () {
    // Account Redirects
    Route::redirect('account', '/account/profile');
    Route::redirect('settings', '/settings/members');

    // Account Management
    Route::prefix('account')->group(function () {
        Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy')
            ->middleware('verified');

        Route::delete('other-browser-sessions', [ProfileController::class, 'destroyOtherBrowserSessions'])
            ->name('other-browser-sessions.destroy');
        Route::delete('browser-session/{sessionId}', [ProfileController::class, 'destroySession'])
            ->name('browser-session.destroy');

        Route::get('password', [PasswordController::class, 'edit'])->name('user-password.edit')
            ->middleware('verified');
        Route::put('password', [PasswordController::class, 'update'])->name('user-password.update')
            ->middleware(['verified', 'throttle:6,1']);

        Route::get('two-factor', [TwoFactorAuthenticationController::class, 'show'])->name('two-factor.show')
            ->middleware('verified');
    });

    // Workspace Settings
    Route::prefix('settings')->name('workspace.')->group(function () {
        Route::get('members', [WorkspaceMemberController::class, 'index'])->name('members.index');
        Route::post('members', [WorkspaceMemberController::class, 'store'])->name('members.store');
        Route::patch('members/{id}', [WorkspaceMemberController::class, 'update'])->name('members.update');
        Route::delete('members/{id}', [WorkspaceMemberController::class, 'destroy'])->name('members.destroy');
        Route::patch('members/{id}/permissions', [WorkspaceMemberController::class, 'updatePermissions'])->name('members.permissions.update');
        Route::get('members/{id}/permissions', [WorkspaceMemberController::class, 'getPermissions'])->name('members.permissions.get');
    });
});
