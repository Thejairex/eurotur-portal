<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cuándo se sincronizó por última vez el perfil de cada persona con el Organigrama.
     * Solo se agrega una columna nula: no se toca ningún dato existente.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('organigrama_sync_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('organigrama_sync_at');
        });
    }
};
