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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->foreignId('workspace_action_id')->nullable()->constrained('workspace_actions')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('new'); // 'new', 'in progress', 'pending', 'completed', 'archive'
            $table->string('priority')->default('normal'); // 'low', 'normal', 'high', 'urgent'
            $table->integer('spent_time')->default(0); // in minutes
            $table->integer('estimated_time')->default(0);
            $table->boolean('count_by_hours')->default(false);
            $table->date('deadline')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
