<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

/**
 * Datos en vivo de la Mesa de Información: el estado de los sensores (temperatura y humedad)
 * y el directorio de teléfonos, leídos de dos hojas de Google con una cuenta de servicio de
 * solo lectura. Las hojas siguen siendo privadas: el portal las lee desde el servidor y
 * muestra solo el resultado.
 *
 * Modos (`modo`): "vivo" (leído de las hojas), "ejemplo" (datos ficticios, para preprod),
 * "no-configurado" (faltan credenciales o ids de hoja) y "error" (Google no respondió).
 *
 * @phpstan-type Datos array{modo: string, sensores: list<array<string, mixed>>, telefonos: list<array{nombre: string, numero: string}>, actualizado: string|null, desactualizado: bool}
 */
class MesaDatosService
{
    private const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';

    /** Segundos que se reutiliza una lectura: cuántas personas abran la página no cambia las llamadas a Google. */
    private const CACHE_SECONDS = 45;

    /** Si el sensor lleva más de esto sin actualizar la hoja, se avisa. */
    private const STALE_MINUTES = 30;

    private const TIMEZONE = 'America/Argentina/Buenos_Aires';

    /**
     * @return Datos
     */
    public function datos(): array
    {
        /** @var Datos|null $cached */
        $cached = Cache::get('mesa.datos');

        if (is_array($cached)) {
            return $cached;
        }

        $datos = $this->leer();

        // Un error no se guarda mucho tiempo: se reintenta enseguida.
        Cache::put('mesa.datos', $datos, $datos['modo'] === 'error' ? 10 : self::CACHE_SECONDS);

        return $datos;
    }

    /**
     * @return Datos
     */
    private function leer(): array
    {
        if (config('services.mesa.datos_ejemplo')) {
            return $this->ejemplo();
        }

        $archivo = (string) config('services.mesa.credenciales');
        $sensoresId = (string) config('services.mesa.sensores_sheet_id');
        $telefonosId = (string) config('services.mesa.telefonos_sheet_id');

        if (! $archivo || ! is_readable($archivo) || ! $sensoresId || ! $telefonosId) {
            return $this->vacio('no-configurado');
        }

        try {
            $token = $this->token($archivo);

            $sensores = $this->parseSensores($this->valores($sensoresId, (string) config('services.mesa.sensores_rango'), $token));
            $telefonos = $this->parseTelefonos($this->valores($telefonosId, (string) config('services.mesa.telefonos_rango'), $token));
        } catch (Throwable $e) {
            report($e);

            return $this->vacio('error');
        }

        return [
            'modo' => 'vivo',
            'sensores' => $sensores['items'],
            'telefonos' => $telefonos,
            'actualizado' => $sensores['actualizado'],
            'desactualizado' => $this->estaDesactualizado($sensores['actualizado']),
        ];
    }

    /**
     * @param  list<list<string>>  $filas
     * @return array{items: list<array<string, mixed>>, actualizado: string|null}
     */
    public function parseSensores(array $filas): array
    {
        $items = [];
        $actualizado = null;

        foreach ($filas as $fila) {
            $nombre = trim((string) ($fila[0] ?? ''));

            if ($nombre === '') {
                continue;
            }

            if (preg_match('/(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/', $nombre, $m) === 1) {
                $actualizado = CarbonImmutable::createFromFormat('Y-m-d H:i', $m[1].' '.$m[2], self::TIMEZONE)->toIso8601String();

                continue;
            }

            $temperatura = $this->numero($fila[1] ?? null);
            $humedad = $this->numero($fila[2] ?? null);

            // Los títulos y encabezados de la hoja no tienen temperatura ni humedad numéricas.
            if ($temperatura === null || $humedad === null) {
                continue;
            }

            $estado = trim((string) ($fila[3] ?? ''));

            $items[] = [
                'nombre' => $nombre,
                'temperatura' => $temperatura,
                'humedad' => $humedad,
                'estado' => $estado,
                'nivel' => $this->nivel($estado),
            ];
        }

        return ['items' => $items, 'actualizado' => $actualizado];
    }

    /**
     * @param  list<list<string>>  $filas
     * @return list<array{nombre: string, numero: string}>
     */
    public function parseTelefonos(array $filas): array
    {
        $telefonos = [];

        foreach ($filas as $fila) {
            $nombre = trim((string) ($fila[0] ?? ''));
            $numero = trim((string) ($fila[1] ?? ''));

            if ($nombre === '' || $numero === '') {
                continue;
            }

            // Encabezado de la hoja.
            if (strcasecmp($numero, 'Numeros') === 0 || strcasecmp($numero, 'Números') === 0) {
                continue;
            }

            $telefonos[] = ['nombre' => $nombre, 'numero' => $numero];
        }

        return $telefonos;
    }

    /** "alerta" si la hoja dice FUERA DE RANGO, "ok" si dice OK / NORMAL / EN RANGO, "desconocido" en otro caso. */
    private function nivel(string $estado): string
    {
        $texto = strtoupper(strtr($estado, ['Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U', 'á' => 'A', 'é' => 'E', 'í' => 'I', 'ó' => 'O', 'ú' => 'U']));

        if (str_contains($texto, 'FUERA') || str_contains($texto, 'ALERTA')) {
            return 'alerta';
        }

        if (str_contains($texto, 'OK') || str_contains($texto, 'NORMAL') || str_contains($texto, 'EN RANGO')) {
            return 'ok';
        }

        return 'desconocido';
    }

    /** Acepta "21,7" (coma de la hoja en español), "21.7" y 22; devuelve null si no es un número. */
    private function numero(mixed $valor): ?float
    {
        $texto = str_replace(',', '.', trim((string) $valor));

        return is_numeric($texto) ? (float) $texto : null;
    }

    private function estaDesactualizado(?string $actualizado): bool
    {
        if ($actualizado === null) {
            return true;
        }

        return CarbonImmutable::parse($actualizado)->diffInMinutes(now(), absolute: true) > self::STALE_MINUTES;
    }

    /**
     * @return list<list<string>>
     */
    private function valores(string $hojaId, string $rango, string $token): array
    {
        $respuesta = Http::withToken($token)
            ->timeout(10)
            ->get('https://sheets.googleapis.com/v4/spreadsheets/'.$hojaId.'/values/'.rawurlencode($rango), [
                'valueRenderOption' => 'FORMATTED_VALUE',
            ])
            ->throw();

        /** @var list<list<string>> $valores */
        $valores = $respuesta->json('values', []);

        return $valores;
    }

    /** Token de acceso de la cuenta de servicio (JWT firmado con su clave privada, válido una hora). */
    private function token(string $archivo): string
    {
        return Cache::remember('mesa.google-token', 3000, function () use ($archivo): string {
            $credenciales = json_decode((string) file_get_contents($archivo), true);

            if (! is_array($credenciales) || empty($credenciales['client_email']) || empty($credenciales['private_key'])) {
                throw new RuntimeException('El archivo de la cuenta de servicio no tiene client_email o private_key.');
            }

            $ahora = time();
            $cabecera = $this->base64Url((string) json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
            $datos = $this->base64Url((string) json_encode([
                'iss' => $credenciales['client_email'],
                'scope' => self::SCOPE,
                'aud' => self::TOKEN_URL,
                'iat' => $ahora,
                'exp' => $ahora + 3600,
            ]));

            if (! openssl_sign($cabecera.'.'.$datos, $firma, $credenciales['private_key'], OPENSSL_ALGO_SHA256)) {
                throw new RuntimeException('No se pudo firmar el token de la cuenta de servicio.');
            }

            $respuesta = Http::asForm()->timeout(10)->post(self::TOKEN_URL, [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $cabecera.'.'.$datos.'.'.$this->base64Url($firma),
            ])->throw();

            return (string) $respuesta->json('access_token');
        });
    }

    private function base64Url(string $texto): string
    {
        return rtrim(strtr(base64_encode($texto), '+/', '-_'), '=');
    }

    /**
     * @return Datos
     */
    private function vacio(string $modo): array
    {
        return ['modo' => $modo, 'sensores' => [], 'telefonos' => [], 'actualizado' => null, 'desactualizado' => false];
    }

    /**
     * Datos ficticios para probar el panel en preprod sin tocar las hojas reales.
     *
     * @return Datos
     */
    private function ejemplo(): array
    {
        return [
            'modo' => 'ejemplo',
            'sensores' => [
                ['nombre' => 'Frente', 'temperatura' => 21.7, 'humedad' => 64.0, 'estado' => 'OK', 'nivel' => 'ok'],
                ['nombre' => 'Contrafrente', 'temperatura' => 22.0, 'humedad' => 63.0, 'estado' => 'OK', 'nivel' => 'ok'],
                ['nombre' => 'Sala reuniones', 'temperatura' => 27.4, 'humedad' => 70.0, 'estado' => 'FUERA DE RANGO', 'nivel' => 'alerta'],
            ],
            'telefonos' => [
                ['nombre' => 'Operadora (ejemplo)', 'numero' => '1155550101'],
                ['nombre' => 'Customer Care (ejemplo)', 'numero' => '1155550102'],
                ['nombre' => 'Guardias (ejemplo)', 'numero' => '1155550103'],
                ['nombre' => 'Adm Fle y Ush (ejemplo)', 'numero' => '2965550104'],
                ['nombre' => 'Suc. Ush. (ejemplo)', 'numero' => '2901550105'],
                ['nombre' => 'Celular Salta (ejemplo)', 'numero' => '1155550106'],
            ],
            'actualizado' => CarbonImmutable::now()->subMinutes(5)->toIso8601String(),
            'desactualizado' => false,
        ];
    }
}
