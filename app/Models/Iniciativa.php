<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $frente_id
 * @property string $n
 * @property string $badge
 * @property string $cls
 * @property string $desc
 * @property string|null $url
 * @property string|null $file_path
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['frente_id', 'n', 'badge', 'cls', 'desc', 'url', 'file_path', 'sort_order'])]
class Iniciativa extends Model
{
    /**
     * @return BelongsTo<Frente, $this>
     */
    public function frente(): BelongsTo
    {
        return $this->belongsTo(Frente::class);
    }

    public function resolvedUrl(): ?string
    {
        if ($this->file_path !== null) {
            return Storage::disk('public')->url($this->file_path);
        }

        return $this->url;
    }
}
