<?php

use App\Http\Controllers\Dashboard\Account\PasswordController;
use App\Http\Controllers\Dashboard\Account\ProfileController;
use App\Http\Controllers\Dashboard\Account\TwoFactorAuthenticationController;
use App\Http\Controllers\Dashboard\Settings\ActionTypeController;
use App\Http\Controllers\Dashboard\Settings\LabelController;
use App\Http\Controllers\Dashboard\Settings\WorkspaceMemberController;
use App\Http\Controllers\Dashboard\ClientController;
use App\Http\Controllers\Dashboard\ProjectController;
use App\Http\Controllers\Dashboard\WorkspaceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard/dashboard');
    })->name('dashboard');

    Route::post('workspace/switch/{workspace}', [WorkspaceController::class, 'switch'])->name('workspace.switch');

    // Modules
    Route::get('clients', [ClientController::class, 'index'])->name('clients.index');
    Route::post('clients', [ClientController::class, 'store'])->name('clients.store');
    Route::get('projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::match(['put', 'patch'], 'projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::get('projects/{project}/tasks', [ProjectController::class, 'getTasks'])->name('projects.tasks');
    Route::get('projects/kanban', [ProjectController::class, 'kanban'])->name('projects.kanban');

    Route::post('time-entries', [\App\Http\Controllers\Dashboard\TimeEntryController::class, 'store'])->name('time-entries.store');
    Route::post('time-entries/manual', [\App\Http\Controllers\Dashboard\TimeEntryController::class, 'manualStore'])->name('time-entries.manual');
    Route::post('time-entries/{timeEntry}/stop', [\App\Http\Controllers\Dashboard\TimeEntryController::class, 'stop'])->name('time-entries.stop');
    Route::post('time-entries/{timeEntry}/recovery', [\App\Http\Controllers\Dashboard\TimeEntryController::class, 'recoveryAction'])->name('time-entries.recovery');

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

        Route::delete('invitations/{id}', [WorkspaceMemberController::class, 'cancelInvitation'])->name('invitations.cancel');
        Route::post('invitations/{id}/resend', [WorkspaceMemberController::class, 'resendInvitation'])->name('invitations.resend');

        Route::get('labels', [LabelController::class, 'index'])->name('labels.index');
        Route::post('labels', [LabelController::class, 'store'])->name('labels.store');
        // Id can be passed as a route parameter for update/destroy
        Route::patch('labels/{id}', [LabelController::class, 'update'])->name('labels.update');
        Route::delete('labels/{id}', [LabelController::class, 'destroy'])->name('labels.destroy');

        Route::get('action-types', [ActionTypeController::class, 'index'])->name('action-types.index');
        Route::post('action-types', [ActionTypeController::class, 'store'])->name('action-types.store');
        Route::post('action-types/{id}/attach', [ActionTypeController::class, 'attach'])->name('action-types.attach');
        Route::patch('action-types/{id}', [ActionTypeController::class, 'update'])->name('action-types.update');
        Route::delete('action-types/{id}', [ActionTypeController::class, 'destroy'])->name('action-types.destroy');
    });
});
