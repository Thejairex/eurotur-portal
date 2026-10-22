<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Novedades del sistema y marca de lectura por persona. Se cargan las primeras novedades
     * (los cambios recientes del portal) solo si la tabla está vacía.
     */
    public function up(): void
    {
        Schema::create('novedades', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            $table->string('titulo', 160);
            $table->text('texto');
            $table->foreignId('creado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('novedad_lecturas', function (Blueprint $table) {
            $table->foreignId('novedad_id')->constrained('novedades')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('leida_at');
            $table->primary(['novedad_id', 'user_id']);
        });

        if (DB::table('novedades')->count() === 0) {
            $ahora = now();

            DB::table('novedades')->insert([
                ['fecha' => '2026-10-22', 'titulo' => 'Nuevo diseño del portal', 'texto' => 'El portal estrena fondo gris claro, tarjetas blancas y un menú lateral con íconos.', 'created_at' => $ahora, 'updated_at' => $ahora],
                ['fecha' => '2026-10-22', 'titulo' => 'Sesión arriba a la derecha', 'texto' => 'Iniciar sesión, el Back Office y salir ahora están en la franja de arriba, a la derecha.', 'created_at' => $ahora, 'updated_at' => $ahora],
                ['fecha' => '2026-10-21', 'titulo' => 'Contenido migrado', 'texto' => 'El contenido del portal anterior (Google Sites) ya está cargado en el portal nuevo.', 'created_at' => $ahora, 'updated_at' => $ahora],
                ['fecha' => '2026-10-21', 'titulo' => 'Contrataciones y Operaciones reordenadas', 'texto' => 'Ambas páginas quedaron con la misma estructura que tenían en el portal anterior.', 'created_at' => $ahora, 'updated_at' => $ahora],
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('novedad_lecturas');
        Schema::dropIfExists('novedades');
    }
};
