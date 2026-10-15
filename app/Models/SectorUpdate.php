<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Última modificación de la página de un sector.
 *
 * @property int $id
 * @property string $sector
 * @property string|null $edited_by_name
 * @property Carbon $edited_at
 */
#[Fillable(['sector', 'edited_by_name', 'edited_at'])]
class SectorUpdate extends Model
{
    public $timestamps = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'edited_at' => 'datetime',
        ];
    }
}
