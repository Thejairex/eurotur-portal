<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\PageOwners;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('usuarios:asignar-paginas {--aplicar : Escribe los permisos; sin esta opción solo muestra qué se asignaría}')]
#[Description('Da a cada responsable permiso para editar solo sus páginas (mapa por correo de config/responsables.php)')]
class AssignPageOwners extends Command
{
    public function handle(): int
    {
        $aplicar = (bool) $this->option('aplicar');
        $labels = PageOwners::grantable();

        $this->line($aplicar ? 'APLICANDO' : 'SIMULACIÓN (no se escribe nada)');
        $this->newLine();

        $mapa = array_keys((array) config('responsables.por_correo'));
        $usuarios = User::query()->whereIn('email', $mapa)->get()->keyBy('email');

        foreach ($mapa as $correo) {
            $user = $usuarios->get($correo);

            if ($user === null) {
                $this->line("{$correo}: todavía no tiene usuario");

                continue;
            }

            $nuevas = array_diff(PageOwners::mappedFor($correo), $user->extraPermissionSlugs());
            $this->line($correo.': '.($nuevas === [] ? 'ya está' : implode(', ', array_map(fn (string $s): string => $labels[$s], $nuevas))));

            if ($aplicar) {
                PageOwners::applyMap($user);
            }
        }

        if (! $aplicar) {
            $this->newLine();
            $this->info('No se escribió nada. Para aplicar: --aplicar');
        }

        return self::SUCCESS;
    }
}
