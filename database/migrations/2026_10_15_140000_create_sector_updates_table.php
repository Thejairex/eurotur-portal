<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cuándo y quién modificó por última vez la página de cada sector (grupos, links, frentes e
     * iniciativas). Alimenta el "actualizado ..." del pie de cada página. Una fila por sector.
     */
    public function up(): void
    {
        Schema::create('sector_updates', function (Blueprint $table) {
            $table->id();
            $table->string('sector')->unique();
            $table->string('edited_by_name')->nullable();
            $table->timestamp('edited_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sector_updates');
    }
};
