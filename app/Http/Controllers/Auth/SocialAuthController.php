<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\LinkedSocialAccount;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    public function redirect($provider)
    {
        if (!in_array($provider, ['google', 'github', 'facebook'])) {
            return redirect()->route('login')->withErrors(['provider' => 'Nieobsługiwany dostawca.']);
        }

        return Socialite::driver($provider)->redirect();
    }

    public function callback($provider)
    {
        try {
            /** @var \Laravel\Socialite\Two\User $providerUser */
            $providerUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors(['provider' => 'Błąd autoryzacji u dostawcy.']);
        }

        $linkedAccount = LinkedSocialAccount::where('provider_name', $provider)
            ->where('provider_id', $providerUser->getId())
            ->first();

        if ($linkedAccount) {
            Auth::login($linkedAccount->user);
            return redirect()->intended(config('fortify.home'));
        }

        $email = $providerUser->getEmail();
        $user = User::where('email', $email)->first();

        if (!$user) {
            $user = User::create([
                'name' => $providerUser->getName() ?? $providerUser->getNickname() ?? 'Użytkownik',
                'email' => $email,
                'password' => bcrypt(Str::random(24)),
                'email_verified_at' => now(), // Social login is pre-verified
            ]);
        }

        LinkedSocialAccount::create([
            'user_id' => $user->id,
            'provider_name' => $provider,
            'provider_id' => $providerUser->getId(),
            'token' => $providerUser->token,
            'refresh_token' => $providerUser->refreshToken,
            'expires_at' => isset($providerUser->expiresIn) ? now()->addSeconds($providerUser->expiresIn) : null,
        ]);

        Auth::login($user);

        return redirect()->intended(config('fortify.home'));
    }
}
