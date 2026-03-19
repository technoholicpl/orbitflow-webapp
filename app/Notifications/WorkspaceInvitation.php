<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WorkspaceInvitation extends Notification
{
    use Queueable;

    protected $invitation;

    /**
     * Create a new notification instance.
     */
    public function __construct($invitation)
    {
        $this->invitation = $invitation;
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
        $workspace = $this->invitation->workspace;
        $inviter = $this->invitation->inviter;
        $url = url('/invitations/accept/' . $this->invitation->token);

        return (new MailMessage)
                    ->subject('Zaproszenie do zespołu - OrbitFlow')
                    ->greeting('Witaj!')
                    ->line('Użytkownik ' . ($inviter->name ?? 'Ktoś') . ' zaprosił Cię do współdzielenia przestrzeni roboczej: ' . $workspace->name)
                    ->action('Zaakceptuj zaproszenie', $url)
                    ->line('Zaloguj się do systemu, aby zobaczyć szczegóły zaproszenia i dołączyć do zespołu.')
                    ->line('Dziękujemy za korzystanie z naszej aplikacji!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'workspace_invitation',
            'invitation_id' => $this->invitation->id,
            'workspace_title' => $this->invitation->workspace->name,
            'inviter_name' => $this->invitation->inviter->name ?? 'Użytkownik',
            'token' => $this->invitation->token,
            'message' => 'Użytkownik ' . ($this->invitation->inviter->name ?? 'Ktoś') . ' wysłał Ci zaproszenie do Worspace ' . $this->invitation->workspace->name
        ];
    }
}
