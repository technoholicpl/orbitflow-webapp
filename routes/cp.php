<?php

use App\Http\Controllers\Admin\Account\PasswordController;
use App\Http\Controllers\Admin\Account\ProfileController;
use App\Http\Controllers\Admin\Account\TwoFactorAuthenticationController;
use App\Http\Controllers\Admin\AdminManagementController;
use App\Http\Controllers\Admin\ActionTypeController as AdminActionTypeController;
use App\Http\Controllers\Admin\Auth\ConfirmablePasswordController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$adminPrefix = config('cp.prefix', 'admin');

Route::middleware(['web'])
    ->prefix($adminPrefix)
    ->name('admin.')
    ->group(function () {
        
        // Guest/Auth agnostic routes (Fortify)
        Route::group([], function () {
            $originalGuard = config('fortify.guard');
            $originalPasswords = config('fortify.passwords');
            
            config(['fortify.guard' => 'admins']);
            config(['fortify.passwords' => 'admins']);
            
            require base_path('vendor/laravel/fortify/routes/routes.php');
            
            config(['fortify.guard' => $originalGuard]);
            config(['fortify.passwords' => $originalPasswords]);

            // Overwrite the password confirmation route specifically for admins
            Route::post('/user/confirm-password', [ConfirmablePasswordController::class, 'store'])
                ->name('password.confirm');
        });

        // Authenticated Admin Routes
        Route::middleware(['auth:admins'])->group(function () {
            Route::inertia('dashboard', 'admin/dashboard')->name('dashboard');

            // Account Management
            Route::prefix('account')->group(function () {
                Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
                Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
                Route::delete('other-browser-sessions', [ProfileController::class, 'destroyOtherBrowserSessions'])
                    ->name('other-browser-sessions.destroy');
                Route::delete('browser-session/{sessionId}', [ProfileController::class, 'destroySession'])
                    ->name('browser-session.destroy');

                Route::get('password', [PasswordController::class, 'edit'])->name('user-password.edit');
                Route::put('password', [PasswordController::class, 'update'])
                    ->middleware('throttle:6,1')
                    ->name('user-password.update');

                Route::get('two-factor', [TwoFactorAuthenticationController::class, 'show'])->name('two-factor.show');
            });

            // Settings & Management
            Route::prefix('settings')->group(function () {
                Route::inertia('appearance', 'admin/settings/appearance')->name('appearance.edit');
                
                Route::get('admins', [AdminManagementController::class, 'index'])->name('admins.index');
                Route::patch('admins/{admin}/role', [AdminManagementController::class, 'updateRole'])->name('admins.role.update');
                Route::delete('admins/{admin}', [AdminManagementController::class, 'destroy'])->name('admins.destroy');

                Route::get('action-types', [AdminActionTypeController::class, 'index'])->name('action-types.index');
                Route::post('action-types', [AdminActionTypeController::class, 'store'])->name('action-types.store');
                Route::patch('action-types/{id}', [AdminActionTypeController::class, 'update'])->name('action-types.update');
                Route::delete('action-types/{id}', [AdminActionTypeController::class, 'destroy'])->name('action-types.destroy');
            });

            // Plans & Features Management
            Route::group(['prefix' => 'settings'], function () {
                Route::get('plans', [\App\Http\Controllers\Admin\PlanController::class, 'index'])->name('plans.index');
                Route::get('plans/create', [\App\Http\Controllers\Admin\PlanController::class, 'create'])->name('plans.create');
                Route::post('plans', [\App\Http\Controllers\Admin\PlanController::class, 'store'])->name('plans.store');
                Route::get('plans/{plan}/edit', [\App\Http\Controllers\Admin\PlanController::class, 'edit'])->name('plans.edit');
                Route::patch('plans/{plan}', [\App\Http\Controllers\Admin\PlanController::class, 'update'])->name('plans.update');
                Route::delete('plans/{plan}', [\App\Http\Controllers\Admin\PlanController::class, 'destroy'])->name('plans.destroy');
                Route::post('plans/{plan}/features', [\App\Http\Controllers\Admin\PlanController::class, 'updateFeatures'])->name('plans.features.update');

                Route::get('features', [\App\Http\Controllers\Admin\FeatureController::class, 'index'])->name('features.index');
                Route::post('features', [\App\Http\Controllers\Admin\FeatureController::class, 'store'])->name('features.store');
                Route::delete('features/{feature}', [\App\Http\Controllers\Admin\FeatureController::class, 'destroy'])->name('features.destroy');
            });

            Route::get('users', function () {
                return Inertia::render('admin/users', [
                    'users' => \App\Models\User::all()
                ]);
            })->name('users');

            Route::get('subscriptions', function () {
                return redirect()->route('admin.plans.index');
            })->name('subscriptions');
        });

        // Debug Admin
        Route::get('/debug-admin', function (\Illuminate\Http\Request $request) {
            return [
                'url' => $request->fullUrl(),
                'isAdmin' => $request->isAdmin(),
                'cp_prefix' => config('cp.prefix'),
                'fortify_guard' => config('fortify.guard'),
            ];
        });
    });
