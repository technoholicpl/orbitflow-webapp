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
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->ulid()->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('online_at')->nullable();
            $table->string('password');
            $table->string('phone_number')->nullable();
            $table->boolean('is_superadmin')->default(false);
            $table->string('type')->nullable(); // e.g., 'manager', 'support'
            $table->string('state')->nullable(); // For status management
            $table->string('avatar_url')->nullable();
            $table->json('custom_fields')->nullable();
            $table->rememberToken();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
