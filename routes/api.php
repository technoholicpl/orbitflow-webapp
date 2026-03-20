<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TimeEntryController;

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Projects & Tasks
    Route::name('api.')->group(function () {
        Route::apiResource('projects', ProjectController::class);
        Route::apiResource('tasks', TaskController::class)->only(['store', 'update']);
    });
    
    Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);

    // Time Tracking
    Route::prefix('time-entries')->group(function () {
        Route::get('/current', [TimeEntryController::class, 'current']);
        Route::post('/start', [TimeEntryController::class, 'start']);
        Route::post('/stop', [TimeEntryController::class, 'stop']);
        Route::post('/store', [TimeEntryController::class, 'store']); // Manual entry
        Route::post('/{timeEntry}/recovery', [TimeEntryController::class, 'recovery']);
    });
});
