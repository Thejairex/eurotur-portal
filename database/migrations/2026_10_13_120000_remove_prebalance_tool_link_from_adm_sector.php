<?php

use App\Models\SectorItem;
use Illuminate\Database\Migrations\Migration;

/**
 * Pre-Balance de Módulos se movio al Back Office (Herramientas): la ruta
 * /adm/prebalance ahora exige sesion y el permiso prebalance.use. Se saca del
 * listado publico del sector Administracion el enlace a la herramienta, para
 * que nadie vea un link que le devolveria "prohibido". La documentacion y el
 * instructivo (archivos publicos) se quedan.
 */
return new class extends Migration
{
    public function up(): void
    {
        SectorItem::query()->where('url', '/adm/prebalance')->delete();
    }

    public function down(): void
    {
        // Sin vuelta atras: el contenido del sector lo administran los editores.
    }
};
