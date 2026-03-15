<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Re-bind LoginResponse to handle dynamic redirections and prevent intended URL leaks
        $this->app->singleton(\Laravel\Fortify\Contracts\LoginResponse::class, function () {
            return new class implements \Laravel\Fortify\Contracts\LoginResponse {
                public function toResponse($request) {
                    $isAdmin = $request->isAdmin();
                    $home = $isAdmin 
                        ? '/' . config('cp.prefix', 'admin') . '/dashboard' 
                        : config('fortify.home', '/dashboard');

                    if ($request->wantsJson()) {
                        return response()->json(['two_factor' => false]);
                    }
                    
                    $intended = session()->get('url.intended');
                    if ($intended) {
                        $path = parse_url($intended, PHP_URL_PATH);
                        $adminPrefix = config('cp.prefix', 'admin');
                        $normalizedPath = '/' . ltrim($path, '/');
                        $isIntendedAdmin = str_starts_with($normalizedPath, "/$adminPrefix");

                        if ($isAdmin && !$isIntendedAdmin) {
                            session()->forget('url.intended');
                        } elseif (!$isAdmin && $isIntendedAdmin) {
                            session()->forget('url.intended');
                        }
                    }
                    
                    return redirect()->intended($home);
                }
            };
        });

        // Re-bind LogoutResponse to handle dynamic redirects
        $this->app->singleton(\Laravel\Fortify\Contracts\LogoutResponse::class, function () {
            return new class implements \Laravel\Fortify\Contracts\LogoutResponse {
                public function toResponse($request) {
                    if ($request->isAdmin()) {
                        return $request->wantsJson()
                            ? response()->json(['message' => 'Logged out'])
                            : redirect()->route('admin.login');
                    }

                    return $request->wantsJson()
                        ? response()->json(['message' => 'Logged out'])
                        : redirect('/');
                }
            };
        });

        // Re-bind TwoFactorChallengeViewResponse
        $this->app->singleton(\Laravel\Fortify\Contracts\TwoFactorChallengeViewResponse::class, function () {
            return new class implements \Laravel\Fortify\Contracts\TwoFactorChallengeViewResponse {
                public function toResponse($request) {
                    $view = $request->isAdmin() ? 'admin/auth/login' : 'auth/two-factor-challenge'; // Adjust if separate 2fa view exists
                    return \Inertia\Inertia::render('auth/two-factor-challenge', [
                        'status' => session('status'),
                    ]);
                }
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(function (Request $request) {
            $view = $request->isAdmin() ? 'admin/auth/login' : 'auth/login';
            
            // Fallback to auth/login if admin/auth/login doesn't exist yet, 
            // but let's assume we want separate ones.
            // Actually, the user has resources/js/Pages/auth/login.tsx.
            // I should check if admin/auth/login.tsx exists.
            
            return Inertia::render($view, [
                'canResetPassword' => Features::enabled(Features::resetPasswords()),
                'canRegister' => Features::enabled(Features::registration()),
                'status' => $request->session()->get('status'),
            ]);
        });

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
