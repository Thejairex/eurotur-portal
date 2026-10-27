<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `must_change_password`: la contraseña actual es temporal y hay que cambiarla en el primer ingreso.
     * `welcome_sent_at`: cuándo se mandó el último correo de bienvenida. Solo columnas nuevas.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('must_change_password')->default(false);
            $table->timestamp('welcome_sent_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['must_change_password', 'welcome_sent_at']);
        });
    }
};
