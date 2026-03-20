<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

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
    // Social Authentication Routes
    Route::get('/auth/social/{provider}', [\App\Http\Controllers\Auth\SocialAuthController::class, 'redirect'])
        ->name('social.redirect');
    Route::get('/auth/social/{provider}/callback', [\App\Http\Controllers\Auth\SocialAuthController::class, 'callback'])
        ->name('social.callback');

    require base_path('vendor/laravel/fortify/routes/routes.php');

    // Overriding Fortify Email Verification
    Route::middleware(['auth'])->group(function () {
        Route::get('/email/verify', [\App\Http\Controllers\Auth\EmailVerificationController::class, 'notice'])
            ->name('verification.notice');

        Route::post('/email/verify', [\App\Http\Controllers\Auth\EmailVerificationController::class, 'verify'])
            ->middleware(['throttle:6,1'])
            ->name('verification.verify_code');

        Route::post('/email/verification-notification', [\App\Http\Controllers\Auth\EmailVerificationController::class, 'resend'])
            ->middleware(['throttle:6,1'])
            ->name('verification.send');
    });

    Route::get('/invitations/accept/{token}', [\App\Http\Controllers\InvitationController::class, 'accept'])
        ->name('invitations.accept');

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('/onboarding', [\App\Http\Controllers\Dashboard\OnboardingController::class, 'index'])
            ->name('onboarding.index');
        Route::post('/onboarding', [\App\Http\Controllers\Dashboard\OnboardingController::class, 'store'])
            ->name('onboarding.store');
        Route::post('/onboarding/plan', [\App\Http\Controllers\Dashboard\OnboardingController::class, 'selectPlan'])
            ->name('onboarding.plan');
        Route::post('/onboarding/finish', [\App\Http\Controllers\Dashboard\OnboardingController::class, 'finish'])
            ->name('onboarding.finish');

        Route::post('/invitations/reject/{token}', [\App\Http\Controllers\InvitationController::class, 'reject'])
            ->name('invitations.reject');
    });
});

// Dashboard & Account Routes
require __DIR__.'/dashboard.php';

// Admin Panel Routes
require __DIR__.'/cp.php';
