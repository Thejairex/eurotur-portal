<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\Permission;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property int|null $role_id
 * @property-read Role|null $role
 * @property int|null $prepagos_analista_codigo
 * @property Carbon|null $email_verified_at
 * @property string|null $puesto
 * @property string|null $area
 * @property string|null $sede
 * @property string|null $interno
 * @property string|null $foto_path
 * @property Carbon|null $portal_tour_completed_at
 * @property Carbon|null $backoffice_tour_completed_at
 * @property Carbon|null $organigrama_sync_at
 * @property bool $must_change_password
 * @property Carbon|null $welcome_sent_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role_id', 'prepagos_analista_codigo'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /** @var list<string>|null */
    private ?array $extraPermissionCache = null;

    /**
     * @return BelongsTo<Role, $this>
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Permisos dados a esta persona en particular (por ejemplo, qué páginas edita), además de los de su rol.
     *
     * @return HasMany<UserPermission, $this>
     */
    public function extraPermissions(): HasMany
    {
        return $this->hasMany(UserPermission::class);
    }

    /**
     * @return list<string>
     */
    public function extraPermissionSlugs(): array
    {
        return $this->extraPermissionCache ??= array_values(array_map(
            'strval',
            $this->extraPermissions()->pluck('permission')->all(),
        ));
    }

    public function forgetExtraPermissions(): void
    {
        $this->extraPermissionCache = null;
    }

    /**
     * Fortify lowercases the login email (lowercase_usernames=true) and
     * Postgres '=' is case-sensitive, so emails must always be stored
     * lowercase or login lookup misses. Safety net for every write path
     * (admin panel, seeders, tinker).
     */
    protected function email(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value): ?string => $value === null ? null : mb_strtolower(trim($value)),
        );
    }

    public function roleSlug(): ?string
    {
        return $this->role?->slug;
    }

    public function isAdmin(): bool
    {
        return $this->roleSlug() === UserRole::Admin->value;
    }

    /**
     * Every permission slug this user holds. Admins get the full catalogue so
     * the frontend sees the same thing the Gate::before shortcut grants.
     *
     * @return list<string>
     */
    public function permissionSlugs(): array
    {
        if ($this->isAdmin()) {
            return Permission::values();
        }

        return array_values(array_unique([
            ...($this->role?->permissionSlugs() ?? []),
            ...$this->extraPermissionSlugs(),
        ]));
    }

    public function hasPermission(Permission|string $permission): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $slug = $permission instanceof Permission ? $permission->value : $permission;

        return in_array($slug, $this->permissionSlugs(), true);
    }

    /**
     * Whether the user may edit any portal content.
     */
    public function canEditPortal(): bool
    {
        foreach (Permission::contentPermissions() as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Whether the user may see at least one card on the "Herramientas" hub.
     */
    public function canViewTools(): bool
    {
        foreach (Permission::toolsPermissions() as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'portal_tour_completed_at' => 'datetime',
            'backoffice_tour_completed_at' => 'datetime',
            'organigrama_sync_at' => 'datetime',
            'must_change_password' => 'boolean',
            'welcome_sent_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
