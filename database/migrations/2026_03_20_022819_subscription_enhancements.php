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
        Schema::table('features', function (Blueprint $table) {
            $table->string('category')->nullable()->after('name');
        });

        Schema::table('workspaces', function (Blueprint $table) {
            $table->json('custom_limits')->nullable()->after('billing_cycle');
            $table->string('coupon_code')->nullable()->after('custom_limits');
        });

        Schema::table('plan_prices', function (Blueprint $table) {
            $table->timestamp('sale_start_at')->nullable()->after('sale_price');
            $table->timestamp('sale_ends_at')->nullable()->after('sale_start_at');
        });

        Schema::table('plans', function (Blueprint $table) {
            $table->boolean('is_promoted')->default(false)->after('description');
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type'); // 'fixed', 'percentage'
            $table->decimal('value', 10, 2);
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
        
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('is_promoted');
        });

        Schema::table('plan_prices', function (Blueprint $table) {
            $table->dropColumn(['sale_start_at', 'sale_ends_at']);
        });

        Schema::table('workspaces', function (Blueprint $table) {
            $table->dropColumn(['custom_limits', 'coupon_code']);
        });

        Schema::table('features', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
