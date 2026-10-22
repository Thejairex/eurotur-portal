<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Archivos para descargar desde el Back Office. El archivo vive fuera de la carpeta pública
     * (disco "local") y se entrega por una ruta con sesión.
     */
    public function up(): void
    {
        Schema::create('descargas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 160);
            $table->string('archivo');
            $table->string('nombre_original');
            $table->string('extension', 10);
            $table->unsignedBigInteger('tamano');
            $table->foreignId('subido_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('descargas');
    }
};
