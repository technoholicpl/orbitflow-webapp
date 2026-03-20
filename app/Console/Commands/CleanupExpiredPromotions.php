<?php

namespace App\Console\Commands;

use App\Models\PlanPrice;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupExpiredPromotions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-expired-promotions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up expired promotions by resetting sale fields in PlanPrice model.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired promotions...');

        $query = PlanPrice::whereNotNull('sale_ends_at')
            ->where('sale_ends_at', '<', now());

        $count = (clone $query)->count();

        if ($count === 0) {
            $this->info('No expired promotions found.');
            return;
        }

        $query->update([
            'sale_price' => null,
            'sale_start_at' => null,
            'sale_ends_at' => null,
        ]);

        $message = "Successfully cleaned up {$count} expired promotions.";
        $this->info($message);
        Log::info($message);
    }
}
