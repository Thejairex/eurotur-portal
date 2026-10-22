<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Novedad del sistema que se muestra en el Back Office.
 *
 * @property int $id
 * @property Carbon $fecha
 * @property string $titulo
 * @property string $texto
 * @property int|null $creado_por
 */
#[Fillable(['fecha', 'titulo', 'texto', 'creado_por'])]
class Novedad extends Model
{
    protected $table = 'novedades';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha' => 'date',
        ];
    }
}
