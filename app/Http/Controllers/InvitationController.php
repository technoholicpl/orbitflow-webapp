<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Workspace;
use App\Notifications\InvitationAccepted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InvitationController extends Controller
{
    public function accept(Request $request, $token)
    {
        $invitation = Invitation::where('token', $token)
            ->where('expires_at', '>', now())
            ->whereNull('accepted_at')
            ->first();

        if (!$invitation) {
            return redirect()->route('dashboard')->with('error', 'Zaproszenie jest nieważne lub już zostało wykorzystane.');
        }

        if (!$request->user()) {
            // Guest user - store token in session and redirect to register
            session(['pending_invitation_token' => $token]);
            return redirect()->route('register')->with('info', 'Zaloguj się lub utwórz konto, aby dołączyć do zespołu.');
        }

        $user = $request->user();

        // Check if the email matches
        if ($user->email !== $invitation->email) {
            return redirect()->route('dashboard')->with('error', 'To zaproszenie było przeznaczone dla innego adresu e-mail.');
        }

        $invitationService = app(\App\Services\InvitationService::class);
        $success = $invitationService->acceptTokenForUser($user, $token);

        if ($success) {
            return redirect()->route('dashboard')->with('success', 'Dołączono do przestrzeni roboczej: ' . $invitation->workspace->name);
        }

        return redirect()->route('dashboard')->with('error', 'Wystąpił błąd podczas dołączania do zespołu.');
    }

    public function reject(Request $request, $token)
    {
        $invitation = Invitation::where('token', $token)->first();

        if ($invitation) {
            $invitation->delete();
            
            $request->user()->unreadNotifications()
                ->where('data->token', $token)
                ->get()
                ->each(function($notification) {
                    $notification->markAsRead();
                });
        }

        return redirect()->back()->with('success', 'Zaproszenie zostało odrzucone.');
    }
}
