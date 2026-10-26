<?php

namespace App\Services;

use App\Enums\Permission;
use App\Models\User;
use App\Models\UserPermission;

/**
 * Qué páginas puede editar cada persona, además de lo que ya le da su rol. Es un permiso "extra" por
 * persona (tabla `user_permissions`); el servidor lo valida en cada guardado igual que el del rol.
 */
class PageOwners
{
    /**
     * Permisos que se pueden dar página por página, con su nombre para mostrar.
     *
     * @return array<string, string> slug => nombre
     */
    public static function grantable(): array
    {
        $options = [];

        foreach ([...Permission::sectorPermissions(), Permission::InnovacionManage, Permission::ExchangeRateManage] as $permission) {
            $options[$permission->value] = $permission->label();
        }

        return $options;
    }

    /**
     * Permisos de página que el mapa por correo le da a este correo.
     *
     * @return list<string>
     */
    public static function mappedFor(string $email): array
    {
        // Ojo: el correo tiene puntos, así que no se puede usar la notación con puntos de config().
        /** @var array<string, list<string>> $map */
        $map = config('responsables.por_correo', []);
        $slugs = $map[mb_strtolower(trim($email))] ?? [];

        return array_values(array_intersect($slugs, array_keys(self::grantable())));
    }

    /**
     * Deja a la persona con exactamente estas páginas (solo se tocan las que se pueden dar una por una;
     * cualquier otro permiso suyo queda como está).
     *
     * @param  list<string>  $slugs
     */
    public static function sync(User $user, array $slugs): void
    {
        $allowed = array_keys(self::grantable());
        $slugs = array_values(array_intersect(array_unique($slugs), $allowed));

        UserPermission::query()
            ->where('user_id', $user->id)
            ->whereIn('permission', $allowed)
            ->whereNotIn('permission', $slugs)
            ->delete();

        foreach ($slugs as $slug) {
            UserPermission::query()->firstOrCreate(['user_id' => $user->id, 'permission' => $slug]);
        }

        $user->forgetExtraPermissions();
    }

    /**
     * Suma las del mapa por correo a las que la persona ya tenga (no quita ninguna).
     */
    public static function applyMap(User $user): void
    {
        $mapped = self::mappedFor($user->email);

        if ($mapped === []) {
            return;
        }

        self::sync($user, [...$user->extraPermissionSlugs(), ...$mapped]);
    }
}
