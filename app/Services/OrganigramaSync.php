<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

/**
 * Sincroniza el perfil del Back Office con el Organigrama (fuente de verdad de quién es quién).
 *
 * Siempre en un solo sentido, del Organigrama al portal: puesto, área (sector) y sede se copian;
 * el interno solo si la persona todavía no cargó uno; la foto y el mail no se tocan. Las personas se
 * reconocen únicamente por mail exacto: si no coincide, no se adivina. Las que el Organigrama todavía
 * marca con datos de ejemplo se ignoran.
 */
class OrganigramaSync
{
    /** Largo máximo de cada columna de `users`. */
    private const LIMITS = ['puesto' => 120, 'area' => 120, 'sede' => 80, 'interno' => 20];

    /**
     * Lee el Organigrama y calcula qué cambiaría, sin escribir nada.
     *
     * @return array{aplicables: list<array{user: User, cambios: array<string, string>}>, sin_usuario: list<string>, ambiguos: list<string>, ejemplo: int}
     */
    public function planificar(): array
    {
        $personas = $this->leer();
        $ejemplo = 0;
        $porMail = [];

        foreach ($personas as $persona) {
            if ($persona['datos_ejemplo']) {
                $ejemplo++;

                continue;
            }

            $porMail[$persona['mail']][] = $persona;
        }

        $users = User::query()->whereIn('email', array_keys($porMail))->get()->keyBy('email');
        $aplicables = [];
        $sinUsuario = [];
        $ambiguos = [];

        foreach ($porMail as $mail => $grupo) {
            $distintos = array_unique(array_map(
                fn (array $p): string => implode('|', [$p['puesto'], $p['sector'], $p['sede'], $p['interno']]),
                $grupo,
            ));

            if (count($distintos) > 1) {
                $ambiguos[] = (string) $mail;

                continue;
            }

            $user = $users->get($mail);

            if ($user === null) {
                $sinUsuario[] = (string) $mail;

                continue;
            }

            $aplicables[] = ['user' => $user, 'cambios' => $this->cambios($user, $grupo[0])];
        }

        return [
            'aplicables' => $aplicables,
            'sin_usuario' => $sinUsuario,
            'ambiguos' => $ambiguos,
            'ejemplo' => $ejemplo,
        ];
    }

    /**
     * Escribe lo planificado y marca a cada persona reconocida como sincronizada ahora.
     *
     * @param  array{aplicables: list<array{user: User, cambios: array<string, string>}>}  $plan
     */
    public function aplicar(array $plan): int
    {
        $ahora = now();

        foreach ($plan['aplicables'] as $item) {
            $item['user']->forceFill([...$item['cambios'], 'organigrama_sync_at' => $ahora])->save();
        }

        return count($plan['aplicables']);
    }

    /**
     * Manda al Organigrama la foto que la persona acaba de subir en Mi perfil, para que quede una sola
     * en los dos lados. Es un envío "de cortesía": si el Organigrama no está configurado, no responde o
     * no tiene a esa persona, la foto del portal igual queda guardada y no se interrumpe nada.
     */
    public function enviarFoto(User $user, string $contenido): bool
    {
        $token = (string) config('services.organigrama.token');

        if ($token === '') {
            return false;
        }

        try {
            $respuesta = Http::withToken($token)
                ->timeout(15)
                ->attach('archivo', $contenido, 'foto.webp')
                ->post(rtrim((string) config('services.organigrama.url'), '/').'/api/interno/foto', ['mail' => $user->email]);

            return $respuesta->successful();
        } catch (Throwable $e) {
            report($e);

            return false;
        }
    }

    /**
     * @param  array{puesto: string, sector: string, sede: string, interno: string}  $persona
     * @return array<string, string>
     */
    private function cambios(User $user, array $persona): array
    {
        $cambios = [];
        $nuevos = ['puesto' => $persona['puesto'], 'area' => $persona['sector'], 'sede' => $persona['sede']];

        foreach ($nuevos as $campo => $valor) {
            $valor = $this->recortar($campo, $valor);

            if ($valor !== '' && $valor !== (string) $user->{$campo}) {
                $cambios[$campo] = $valor;
            }
        }

        $interno = $this->recortar('interno', $persona['interno']);

        if ($interno !== '' && (string) $user->interno === '') {
            $cambios['interno'] = $interno;
        }

        return $cambios;
    }

    private function recortar(string $campo, string $valor): string
    {
        return Str::limit(trim($valor), self::LIMITS[$campo], '');
    }

    /**
     * @return list<array{mail: string, puesto: string, sector: string, sede: string, interno: string, datos_ejemplo: bool}>
     */
    private function leer(): array
    {
        $url = rtrim((string) config('services.organigrama.url'), '/');
        $token = (string) config('services.organigrama.token');

        if ($token === '') {
            throw new RuntimeException('Falta ORGANIGRAMA_TOKEN_INTERNO en el portal.');
        }

        $respuesta = Http::withToken($token)->acceptJson()->timeout(15)->get($url.'/api/interno/personas');

        if ($respuesta->status() === 404) {
            throw new RuntimeException('El Organigrama no tiene habilitada la ruta interna (falta ORGANIGRAMA_TOKEN_INTERNO allá).');
        }

        $respuesta->throw();

        $personas = [];

        foreach ((array) $respuesta->json('personas', []) as $fila) {
            $mail = mb_strtolower(trim((string) ($fila['mail'] ?? '')));

            if ($mail === '') {
                continue;
            }

            $personas[] = [
                'mail' => $mail,
                'puesto' => (string) ($fila['puesto'] ?? ''),
                'sector' => (string) ($fila['sector'] ?? ''),
                'sede' => (string) ($fila['sede'] ?? ''),
                'interno' => (string) ($fila['interno'] ?? ''),
                'datos_ejemplo' => (bool) ($fila['datos_ejemplo'] ?? false),
            ];
        }

        return $personas;
    }
}
