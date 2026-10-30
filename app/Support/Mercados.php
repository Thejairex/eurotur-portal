<?php

namespace App\Support;

/**
 * «Mercados que gestiona»: lista corta de etiquetas por persona (por ejemplo «Mercado Italiano»,
 * «Reino Unido»). Se completa en Mi perfil y se ve en la ficha del Organigrama.
 */
class Mercados
{
    public const MAX = 15;

    public const LARGO_MAX = 40;

    /**
     * Deja la lista limpia: sin espacios de más, sin vacíos y sin repetidos (no distingue mayúsculas, conserva
     * el orden). Acepta una lista o un texto separado por coma, punto y coma o salto de línea.
     *
     * @return list<string>
     */
    public static function normalizar(mixed $valor): array
    {
        if ($valor === null) {
            return [];
        }

        $piezas = is_array($valor) ? $valor : (preg_split('/[;,|\n]+/', (string) $valor) ?: []);
        $limpios = [];
        $vistos = [];

        foreach ($piezas as $pieza) {
            $texto = trim((string) preg_replace('/\s+/u', ' ', strip_tags((string) $pieza)));
            $clave = mb_strtolower($texto);

            if ($texto !== '' && ! isset($vistos[$clave])) {
                $vistos[$clave] = true;
                $limpios[] = $texto;
            }
        }

        return $limpios;
    }
}
