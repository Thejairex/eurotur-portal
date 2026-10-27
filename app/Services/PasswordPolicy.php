<?php

namespace App\Services;

/**
 * Reglas de la contraseña que elige cada persona al entrar por primera vez, con los mensajes en español.
 * La pantalla (resources/js/pages/auth/cambiar-clave.tsx) muestra la misma lista y la va tildando; si se
 * cambia una regla acá, hay que cambiarla también allá.
 */
class PasswordPolicy
{
    public const MIN_LENGTH = 10;

    /**
     * Lo que le falta cumplir a la contraseña (lista vacía: está bien).
     *
     * @return list<string>
     */
    public static function unmet(string $password): array
    {
        $unmet = [];

        if (mb_strlen($password) < self::MIN_LENGTH) {
            $unmet[] = 'al menos '.self::MIN_LENGTH.' caracteres';
        }

        if (! preg_match('/\p{Lu}/u', $password) || ! preg_match('/\p{Ll}/u', $password)) {
            $unmet[] = 'una mayúscula y una minúscula';
        }

        if (! preg_match('/\d/', $password)) {
            $unmet[] = 'un número';
        }

        if (! preg_match('/[^\p{L}\d]/u', $password)) {
            $unmet[] = 'un símbolo (por ejemplo ! # $ % & * + - = ?)';
        }

        return $unmet;
    }
}
