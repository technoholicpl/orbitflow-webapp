<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\EmailVerificationNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class EmailVerificationController extends Controller
{
    public function notice(Request $request)
    {
        return $request->user()->hasVerifiedEmail()
            ? redirect()->intended(config('fortify.home'))
            : Inertia::render('auth/verify-email', [
                'status' => session('status'),
            ]);
    }

    public function verify(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(config('fortify.home'));
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        if ($user->email_verification_code !== $request->code) {
            return back()->withErrors(['code' => 'Podany kod jest nieprawidłowy.']);
        }

        if (now()->gt($user->email_verification_expires_at)) {
            return back()->withErrors(['code' => 'Kod wygasł. Wyślij nowy kod.']);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'email_verification_code' => null,
            'email_verification_expires_at' => null,
        ])->save();

        return redirect()->intended(config('fortify.home'))
            ->with('status', 'E-mail zweryfikowany pomyślnie!');
    }

    public function resend(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(config('fortify.home'));
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        $user->forceFill([
            'email_verification_code' => $code,
            'email_verification_expires_at' => now()->addHour(),
        ])->save();

        $user->notify(new EmailVerificationNotification($code));

        return back()->with('status', 'verification-link-sent');
    }
}
