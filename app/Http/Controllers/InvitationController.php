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

        $user = $request->user();

        // Check if the email matches
        if ($user->email !== $invitation->email) {
            return redirect()->route('dashboard')->with('error', 'To zaproszenie było przeznaczone dla innego adresu e-mail.');
        }

        return DB::transaction(function () use ($invitation, $user) {
            // Set Spatie Team ID for role assignment
            setPermissionsTeamId($invitation->workspace_id);

            // Attach user to workspace via pivot
            $user->workspaces()->syncWithoutDetaching([$invitation->workspace_id => ['role' => $invitation->role]]);
            
            // Assign Spatie Role (Roles are defined globally but assigned per team)
            $user->syncRoles([$invitation->role]);

            // Set as current workspace
            $user->current_workspace_id = $invitation->workspace_id;
            $user->save();

            // Notify inviter
            if ($invitation->inviter) {
                $invitation->inviter->notify(new InvitationAccepted($user, $invitation->workspace));
            }

            // Mark invitation as accepted
            $invitation->update(['accepted_at' => now()]);

            // Delete/Mark database notification if exists
            $user->unreadNotifications()
                ->where('data->token', $invitation->token)
                ->get()
                ->each(function($notification) {
                    $notification->markAsRead();
                });

            return redirect()->route('dashboard')->with('success', 'Dołączono do przestrzeni roboczej: ' . $invitation->workspace->name);
        });
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
