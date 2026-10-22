<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Archivo disponible para descargar desde el Back Office.
 *
 * @property int $id
 * @property string $nombre
 * @property string $archivo
 * @property string $nombre_original
 * @property string $extension
 * @property int $tamano
 * @property int|null $subido_por
 */
#[Fillable(['nombre', 'archivo', 'nombre_original', 'extension', 'tamano', 'subido_por'])]
class Descarga extends Model
{
    protected $table = 'descargas';
}
