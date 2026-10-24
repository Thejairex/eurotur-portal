<?php

namespace App\Console\Commands;

use App\Services\PortalContentSnapshot;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('portal:exportar-contenido {archivo=database/content/portal-contenido.json : Ruta del JSON a escribir}')]
#[Description('Guarda en un JSON los bloques y links de los sectores y los frentes de Innovación cargados desde el navegador')]
class ExportPortalContent extends Command
{
    public function handle(PortalContentSnapshot $snapshot): int
    {
        $path = base_path($this->argument('archivo'));
        $data = $snapshot->export();

        if (! is_dir(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }

        file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)."\n");

        $groups = array_sum(array_map('count', $data['sectores']));
        $this->info('Sectores: '.count($data['sectores'])." · bloques: {$groups} · frentes: ".count($data['frentes']));
        $this->info("Escrito en {$path}");

        return self::SUCCESS;
    }
}
