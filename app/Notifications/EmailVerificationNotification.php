<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationNotification extends Notification
{
    use Queueable;

    protected $code;

    /**
     * Create a new notification instance.
     */
    public function __construct($code)
    {
        $this->code = $code;
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
        return (new MailMessage)
                    ->subject('Kod weryfikacyjny - OrbitFlow')
                    ->greeting('Witaj ' . $notifiable->name . '!')
                    ->line('Dziękujemy za rejestrację w OrbitFlow. Twój 6-cyfrowy kod weryfikacyjny to:')
                    ->line(new \Illuminate\Support\HtmlString('<div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; padding: 20px; background: #f4f4f4; border-radius: 10px;">' . $this->code . '</div>'))
                    ->line('Kod jest ważny przez 1 godzinę.')
                    ->line('Jeśli nie tworzyłeś konta, zignoruj tę wiadomość.');
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
