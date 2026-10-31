<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * «Mercados que gestiona» de cada persona (lista de etiquetas), que se completa en Mi perfil y se envía al
     * Organigrama. Solo se agrega una columna nula: no se toca ningún dato existente.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('mercados')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('mercados');
        });
    }
};
