<?php

namespace App\Console\Commands;

use App\Services\PortalContentSnapshot;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('portal:importar-contenido {archivo=database/content/portal-contenido.json : JSON generado por portal:exportar-contenido} {--solo=* : Sectores a cargar (innovacion = frentes)} {--reemplazar : Pisa el contenido actual de esos sectores}')]
#[Description('Carga el contenido de sectores e Innovación desde el JSON del repositorio, sin duplicar: por defecto no toca lo que ya existe')]
class ImportPortalContent extends Command
{
    public function handle(PortalContentSnapshot $snapshot): int
    {
        $path = base_path($this->argument('archivo'));

        if (! is_file($path)) {
            $this->error("No existe {$path}");

            return self::FAILURE;
        }

        $data = json_decode((string) file_get_contents($path), true);

        if (! is_array($data) || ($data['version'] ?? null) !== PortalContentSnapshot::VERSION) {
            $this->error('El archivo no es una foto válida del portal (versión distinta o JSON roto).');

            return self::FAILURE;
        }

        $only = $this->option('solo') === [] ? null : $this->option('solo');

        foreach ($snapshot->import($data, (bool) $this->option('reemplazar'), $only) as $sector => $result) {
            $this->line("{$sector}: {$result}");
        }

        return self::SUCCESS;
    }
}
