<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hay dos recorridos guiados, cada uno se hace una sola vez por usuario: el del portal
     * (primera visita al portal nuevo) y el del Back Office. La columna que creó la migración
     * anterior pasa a ser la del Back Office y se suma la del portal. Null = todavía no lo hizo.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('onboarding_completed_at', 'backoffice_tour_completed_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('portal_tour_completed_at')->nullable()->after('backoffice_tour_completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('portal_tour_completed_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('backoffice_tour_completed_at', 'onboarding_completed_at');
        });
    }
};
