<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvitationAccepted extends Notification
{
    use Queueable;

    protected $invitee;
    protected $workspace;

    /**
     * Create a new notification instance.
     */
    public function __construct($invitee, $workspace)
    {
        $this->invitee = $invitee;
        $this->workspace = $workspace;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Zaproszenie zaakceptowane - OrbitFlow')
                    ->greeting('Wspaniałe wieści!')
                    ->line('Użytkownik ' . $this->invitee->name . ' zaakceptował Twoje zaproszenie do przestrzeni roboczej: ' . $this->workspace->name)
                    ->action('Przejdź do ustawień zespołu', url('/dashboard/settings/members'))
                    ->line('Teraz możecie wspólnie pracować nad projektami!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'invitation_accepted',
            'invitee_name' => $this->invitee->name,
            'workspace_name' => $this->workspace->name,
            'message' => 'Użytkownik ' . $this->invitee->name . ' dołączył do Twojej przestrzeni ' . $this->workspace->name
        ];
    }
}
