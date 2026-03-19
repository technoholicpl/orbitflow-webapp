<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvitationJoined extends Notification
{
    use Queueable;

    protected $workspace;

    /**
     * Create a new notification instance.
     */
    public function __construct($workspace)
    {
        $this->workspace = $workspace;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'invitation_joined',
            'workspace_name' => $this->workspace->name,
            'message' => 'Dołączyłeś do przestrzeni roboczej: ' . $this->workspace->name
        ];
    }
}
