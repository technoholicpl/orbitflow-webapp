<?php

namespace App\Http\Middleware;

use App\Services\InvitationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandlePendingInvitation
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = session('pending_invitation_token');
        $user = $request->user();

        // If we have a token and the user is logged in, try to accept it
        if ($token && $user) {
            $invitationService = app(InvitationService::class);
            $invitationService->acceptTokenForUser($user, $token);
            
            // Clear the token from the session so it doesn't run again
            session()->forget('pending_invitation_token');
        }

        return $next($request);
    }
}
