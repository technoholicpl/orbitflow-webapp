<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TimerRunningReminder extends Notification
{
    use Queueable;

    public $timeEntry;

    /**
     * Create a new notification instance.
     */
    public function __construct($timeEntry)
    {
        $this->timeEntry = $timeEntry;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $taskName = $this->timeEntry->task?->name ?? $this->timeEntry->project?->name;
        $startedAt = $this->timeEntry->started_at->format('H:i');
        
        return (new MailMessage)
            ->subject('Twój timer nadal działa! ⏱️')
            ->greeting('Cześć ' . $notifiable->name . '!')
            ->line("Twój timer dla zadania **{$taskName}** nadal jest uruchomiony.")
            ->line("Wystartowałeś go dzisiaj o godzinie **{$startedAt}**.")
            ->action('Przejdź do OrbitFlow', url('/dashboard'))
            ->line('Pamiętaj o wyłączeniu licznika po zakończeniu pracy, aby Twoje statystyki były dokładne.')
            ->line('Dziękujemy za korzystanie z OrbitFlow!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
