<?php

namespace App\Http\Controllers\Admin\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the admin's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('admin/account/password');
    }

    /**
     * Update the admin's password.
     */
    public function update(PasswordUpdateRequest $request): RedirectResponse
    {
        /** @var \App\Models\Admin $admin */
        $admin = $request->user();

        $admin->update([
            'password' => $request->password,
        ]);

        return back();
    }
}
