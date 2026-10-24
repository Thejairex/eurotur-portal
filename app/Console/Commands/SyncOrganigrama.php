<?php

namespace App\Console\Commands;

use App\Services\OrganigramaSync;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Throwable;

#[Signature('organigrama:sincronizar {--aplicar : Escribe los cambios; sin esta opción solo muestra qué cambiaría}')]
#[Description('Copia puesto, área, sede e interno del Organigrama al perfil de cada persona (reconocida por mail)')]
class SyncOrganigrama extends Command
{
    public function handle(OrganigramaSync $sync): int
    {
        try {
            $plan = $sync->planificar();
        } catch (Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $aplicar = (bool) $this->option('aplicar');
        $this->line($aplicar ? 'APLICANDO' : 'SIMULACIÓN (no se escribe nada)');
        $this->newLine();

        foreach ($plan['aplicables'] as $item) {
            $detalle = [];

            foreach ($item['cambios'] as $campo => $valor) {
                $detalle[] = "{$campo}: '{$item['user']->{$campo}}' → '{$valor}'";
            }

            $this->line($item['user']->email.': '.($detalle === [] ? 'sin cambios' : implode(', ', $detalle)));
        }

        $this->newLine();
        $this->line('Mails del Organigrama sin usuario en el portal: '.count($plan['sin_usuario']));

        foreach ($plan['sin_usuario'] as $mail) {
            $this->line("  - {$mail}");
        }

        if ($plan['ambiguos'] !== []) {
            $this->warn('Mails repetidos con datos distintos (no se tocan): '.implode(', ', $plan['ambiguos']));
        }

        $this->line("Personas con datos de ejemplo en el Organigrama (ignoradas): {$plan['ejemplo']}");

        if (! $aplicar) {
            $this->newLine();
            $this->info('No se escribió nada. Para aplicar: --aplicar');

            return self::SUCCESS;
        }

        $this->info('Personas sincronizadas: '.$sync->aplicar($plan));

        return self::SUCCESS;
    }
}
