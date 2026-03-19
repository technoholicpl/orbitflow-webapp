<?php

namespace App\Services;

use App\Models\Invitation;
use App\Models\User;
use App\Notifications\InvitationAccepted;
use App\Notifications\InvitationJoined;
use Illuminate\Support\Facades\DB;

class InvitationService
{
    /**
     * Accept an invitation token for a specific user.
     */
    public function acceptTokenForUser(User $user, string $token): bool
    {
        $invitation = Invitation::where('token', $token)
            ->where('expires_at', '>', now())
            ->whereNull('accepted_at')
            ->first();

        if (!$invitation) {
            return false;
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

            // Notify inviter that the invitation was accepted
            if ($invitation->inviter) {
                $invitation->inviter->notify(new InvitationAccepted($user, $invitation->workspace));
            }

            // Notify invitee that they have joined the workspace
            $user->notify(new InvitationJoined($invitation->workspace));

            // Mark invitation as accepted
            $invitation->update(['accepted_at' => now()]);

            // Mark any database notifications for this invitation as read
            $user->unreadNotifications()
                ->where('data->token', $invitation->token)
                ->get()
                ->each->markAsRead();

            return true;
        });
    }
}
