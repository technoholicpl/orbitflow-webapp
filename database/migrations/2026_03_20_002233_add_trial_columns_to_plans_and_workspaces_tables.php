<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->integer('trial_days')->nullable()->after('is_coming_soon');
        });

        Schema::table('workspaces', function (Blueprint $table) {
            $table->timestamp('trial_ends_at')->nullable()->after('subscription_ends_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('trial_days');
        });

        Schema::table('workspaces', function (Blueprint $table) {
            $table->dropColumn('trial_ends_at');
        });
    }
};
