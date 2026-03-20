<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Plan;
use App\Models\Feature;
use App\Models\PlanPrice;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Features
        $maxProjects = Feature::updateOrCreate(['slug' => 'max-projects'], ['name' => 'Max Projects', 'type' => 'limit']);
        $maxProjectsWeekly = Feature::updateOrCreate(['slug' => 'max-projects-weekly'], ['name' => 'Max Projects Per Week', 'type' => 'limit']);
        $maxUsers = Feature::updateOrCreate(['slug' => 'max-users'], ['name' => 'Max Users', 'type' => 'limit']);
        $apiAccess = Feature::updateOrCreate(['slug' => 'api-access'], ['name' => 'API Access', 'type' => 'boolean']);
        $customLabels = Feature::updateOrCreate(['slug' => 'custom-labels'], ['name' => 'Custom Labels', 'type' => 'boolean']);

        // Basic Plan
        $basic = Plan::updateOrCreate(['slug' => 'basic'], [
            'name' => 'Basic',
            'description' => 'Idealny dla osób zaczynających swoją przygodę.',
            'is_free' => true,
            'display_order' => 1,
        ]);
        $basic->features()->sync([
            $maxProjects->id => ['value' => '5', 'period' => null],
            $maxProjectsWeekly->id => ['value' => '2', 'period' => 'weekly'],
            $maxUsers->id => ['value' => '2', 'period' => null],
            $apiAccess->id => ['value' => 'false', 'period' => null],
        ]);

        // Pro Plan
        $pro = Plan::updateOrCreate(['slug' => 'pro'], [
            'name' => 'Professional',
            'description' => 'Dla rosnących zespołów potrzebujących więcej mocy.',
            'is_recommended' => true,
            'display_order' => 2,
            'trial_days' => 7,
        ]);
        
        // Ensure prices exist but don't duplicate
        if ($pro->prices()->count() === 0) {
            $pro->prices()->createMany([
                ['type' => 'month', 'price' => 29.00, 'sale_price' => 19.00, 'lowest_price_30d' => 29.00],
                ['type' => 'year', 'price' => 290.00, 'sale_price' => 190.00, 'lowest_price_30d' => 290.00],
            ]);
        }

        $pro->features()->sync([
            $maxProjects->id => ['value' => '100', 'period' => null],
            $maxProjectsWeekly->id => ['value' => '20', 'period' => 'weekly'],
            $maxUsers->id => ['value' => '10', 'period' => null],
            $apiAccess->id => ['value' => 'true', 'period' => null],
            $customLabels->id => ['value' => 'true', 'period' => null],
        ]);

        // Coming Soon Plan
        Plan::updateOrCreate(['slug' => 'enterprise'], [
            'name' => 'Enterprise',
            'description' => 'Advanced features for large scale operations.',
            'is_coming_soon' => true,
            'display_order' => 3,
        ]);
    }
}
