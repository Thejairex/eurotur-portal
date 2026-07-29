<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $sector
 * @property string $title
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['sector', 'title', 'sort_order'])]
class SectorGroup extends Model
{
    /**
     * @return HasMany<SectorItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(SectorItem::class)->orderBy('sort_order');
    }
}
