<?php

namespace App\Actions\Fortify;

use Illuminate\Contracts\Auth\StatefulGuard;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable as BaseAction;
use Laravel\Fortify\Events\TwoFactorAuthenticationChallenged;
use Laravel\Fortify\LoginRateLimiter;

class RedirectIfTwoFactorAuthenticatable extends BaseAction
{
    /**
     * Get the two factor authentication enabled response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  mixed  $user
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function twoFactorChallengeResponse($request, $user)
    {
        $request->session()->put([
            'login.id' => $user->getKey(),
            'login.remember' => $request->boolean('remember'),
        ]);

        TwoFactorAuthenticationChallenged::dispatch($user);

        if ($request->wantsJson()) {
            return response()->json(['two_factor' => true]);
        }

        if ($request->isAdmin()) {
            return redirect()->route('admin.two-factor.login');
        }

        return redirect()->route('two-factor.login');
    }
}
