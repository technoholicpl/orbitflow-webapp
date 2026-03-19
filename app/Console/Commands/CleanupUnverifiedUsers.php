<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanupUnverifiedUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-unverified-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Usuwa konta użytkowników, które nie zostały aktywowane w ciągu 7 dni.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = \App\Models\User::whereNull('email_verified_at')
            ->where('created_at', '<', now()->subDays(7))
            ->delete();

        $this->info("Usunięto {$count} nieaktywnych kont.");
    }
}
