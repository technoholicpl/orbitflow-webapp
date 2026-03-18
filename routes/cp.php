<?php


// Admin Routes
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


Route::prefix($adminPrefix)->name('admin.')->group(function () {
    Route::middleware(['auth:admins'])->group(function () {
        Route::inertia('dashboard', 'admin/dashboard')->name('dashboard');

        // Admin Settings Routes
        Route::get('account/profile', [\App\Http\Controllers\Admin\Account\ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('account/profile', [\App\Http\Controllers\Admin\Account\ProfileController::class, 'update'])->name('profile.update');
        Route::delete('account/other-browser-sessions', [\App\Http\Controllers\Admin\Account\ProfileController::class, 'destroyOtherBrowserSessions'])
            ->name('other-browser-sessions.destroy');
        Route::delete('account/browser-session/{sessionId}', [\App\Http\Controllers\Admin\Account\ProfileController::class, 'destroySession'])
            ->name('browser-session.destroy');

        Route::get('account/password', [\App\Http\Controllers\Admin\Account\PasswordController::class, 'edit'])->name('user-password.edit');
        Route::put('account/password', [\App\Http\Controllers\Admin\Account\PasswordController::class, 'update'])
            ->middleware('throttle:6,1')
            ->name('user-password.update');

        Route::inertia('settings/appearance', 'admin/settings/appearance')->name('appearance.edit');

        Route::get('account/two-factor', [\App\Http\Controllers\Admin\Account\TwoFactorAuthenticationController::class, 'show'])
            ->name('two-factor.show');

        Route::get('users', function () {
            return Inertia::render('admin/users', [
                'users' => \App\Models\User::all()
            ]);
        })->name('users');

        Route::get('settings/admins', [\App\Http\Controllers\Admin\AdminManagementController::class, 'index'])->name('admins.index');
        Route::patch('settings/admins/{admin}/role', [\App\Http\Controllers\Admin\AdminManagementController::class, 'updateRole'])->name('admins.role.update');
        Route::delete('settings/admins/{admin}', [\App\Http\Controllers\Admin\AdminManagementController::class, 'destroy'])->name('admins.destroy');

        Route::get('subscriptions', function () {
            return Inertia::render('admin/subscriptions');
        })->name('subscriptions');
        // CMS, etc.
    });
});
