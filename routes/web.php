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
    require base_path('vendor/laravel/fortify/routes/routes.php');
});

// Dashboard & Account Routes
require __DIR__.'/dashboard.php';

// Admin Panel Routes
require __DIR__.'/cp.php';
