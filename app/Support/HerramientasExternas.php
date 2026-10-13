<?php

namespace App\Support;

use App\Enums\Permission;

/**
 * Herramientas que viven FUERA del portal (otro contenedor, otro puerto) y que el
 * Back Office puede mostrar dentro de una pantalla propia (en un marco, en la misma
 * pestaña y con el menú del Back Office al costado). La lista de herramientas del
 * menú está en resources/js/lib/backoffice-tools.ts; acá solo se guarda lo que el
 * servidor necesita para armar y proteger esa pantalla.
 *
 * Para sumar una herramienta: una entrada acá + su permiso + su entrada en el menú.
 * La herramienta, por su parte, tiene que entender el modo embebido (?embebido=1):
 * ocultar su propio menú y cabecera, porque el Back Office ya pone los suyos.
 */
final class HerramientasExternas
{
    /** Parámetro que le avisa a la herramienta que va dentro del Back Office. */
    public const PARAMETRO_EMBEBIDO = 'embebido=1';

    /**
     * @return array<string, array{label: string, area: string, permission: Permission, config: string, path: string}>
     */
    public static function todas(): array
    {
        return [
            'big-brother' => [
                'label' => 'Big Brother — Vencimientos',
                'area' => 'RRHH',
                'permission' => Permission::BigBrotherVer,
                'config' => 'services.big_brother.url',
                'path' => '/',
            ],
            'balanz' => [
                'label' => 'Generador de Asientos Balanz',
                'area' => 'Contabilidad',
                'permission' => Permission::BalanzManage,
                'config' => 'services.balanz.url',
                'path' => '/',
            ],
            'prepagos' => [
                'label' => 'Panel de Prepagos',
                'area' => 'Cuentas a Pagar',
                'permission' => Permission::PrepagosManage,
                'config' => 'services.prepagos.url',
                'path' => '/',
            ],
            'organigrama' => [
                'label' => 'Organigrama — Edición',
                'area' => 'RRHH',
                'permission' => Permission::OrganigramaEditar,
                'config' => 'services.organigrama.url',
                'path' => '/editar',
            ],
        ];
    }

    /**
     * @return array{label: string, area: string, permission: Permission, config: string, path: string}|null
     */
    public static function buscar(string $slug): ?array
    {
        return self::todas()[$slug] ?? null;
    }

    /**
     * Dirección de la herramienta: la configurada para el entorno (ej. BIGBROTHER_URL) más su
     * ruta de entrada. Con $embebido agrega el parámetro que activa el modo embebido. Nunca
     * se arma con datos que vengan del pedido.
     */
    public static function url(string $slug, bool $embebido = false): string
    {
        $herramienta = self::buscar($slug);

        if ($herramienta === null) {
            throw new \InvalidArgumentException("Herramienta desconocida: {$slug}");
        }

        $url = rtrim((string) config($herramienta['config']), '/').$herramienta['path'];

        return $embebido ? $url.'?'.self::PARAMETRO_EMBEBIDO : $url;
    }
}
