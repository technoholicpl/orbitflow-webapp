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
            $table->string('account_type')->default('individual'); // 'individual' or 'company'
            $table->string('company_name')->nullable();
            $table->string('tax_id')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('avatar_url')->nullable();
            $table->time('work_day_starts_at')->nullable();
            $table->time('work_day_ends_at')->nullable();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'account_type',
                'company_name',
                'tax_id',
                'phone_number',
                'avatar_url',
                'work_day_starts_at',
                'work_day_ends_at'
            ]);
            $table->dropSoftDeletes();
        });
    }
};
