<?php

namespace App\Services;

/**
 * Contraseña temporal al azar para un usuario nuevo. Sin caracteres que se confundan al leerlos en un mail
 * (0/O, 1/l/I) y con mayúsculas, minúsculas, números y un símbolo, para que cumpla las reglas de producción.
 */
class TemporaryPassword
{
    private const LOWER = 'abcdefghijkmnpqrstuvwxyz';

    private const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

    private const DIGITS = '23456789';

    private const SYMBOLS = '#$%&*+-=?';

    public static function generate(int $length = 14): string
    {
        $all = self::LOWER.self::UPPER.self::DIGITS.self::SYMBOLS;
        $chars = [
            self::pick(self::LOWER),
            self::pick(self::UPPER),
            self::pick(self::DIGITS),
            self::pick(self::SYMBOLS),
        ];

        while (count($chars) < $length) {
            $chars[] = self::pick($all);
        }

        shuffle($chars);

        return implode('', $chars);
    }

    private static function pick(string $set): string
    {
        return $set[random_int(0, strlen($set) - 1)];
    }
}
