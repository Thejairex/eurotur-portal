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
        Schema::create('iniciativas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('frente_id')->constrained()->cascadeOnDelete();
            $table->string('n');
            $table->string('badge');
            $table->string('cls');
            $table->text('desc');
            $table->string('url')->nullable();
            $table->string('file_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iniciativas');
    }
};
