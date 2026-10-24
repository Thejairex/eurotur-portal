<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Datos del perfil de cada persona (Back Office > Mi perfil). Solo se agregan columnas nulas:
     * no se toca ningún dato existente.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('puesto', 120)->nullable();
            $table->string('area', 120)->nullable();
            $table->string('sede', 80)->nullable();
            $table->string('interno', 20)->nullable();
            $table->string('foto_path')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['puesto', 'area', 'sede', 'interno', 'foto_path']);
        });
    }
};
