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
        Schema::table('users', function (Blueprint $table) {
            $table->integer('timer_hard_timeout')->default(12)->after('email');
            $table->time('timer_auto_stop_at')->nullable()->after('timer_hard_timeout');
            $table->integer('timer_remind_every')->default(8)->after('timer_auto_stop_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['timer_hard_timeout', 'timer_auto_stop_at', 'timer_remind_every']);
        });
    }
};
