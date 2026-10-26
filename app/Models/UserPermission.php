<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Un permiso dado a una persona en particular (además de los de su rol).
 *
 * @property int $id
 * @property int $user_id
 * @property string $permission
 */
#[Fillable(['user_id', 'permission'])]
class UserPermission extends Model
{
    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
