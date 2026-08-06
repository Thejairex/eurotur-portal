<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $area
 * @property string|null $owner
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['area', 'owner', 'sort_order'])]
class Frente extends Model
{
    /**
     * @return HasMany<Iniciativa, $this>
     */
    public function iniciativas(): HasMany
    {
        return $this->hasMany(Iniciativa::class)->orderBy('sort_order');
    }
}
