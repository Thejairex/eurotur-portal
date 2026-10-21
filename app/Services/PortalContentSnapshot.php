<?php

namespace App\Services;

use App\Models\Frente;
use App\Models\Iniciativa;
use App\Models\SectorGroup;
use App\Models\SectorItem;
use Illuminate\Support\Facades\DB;

/**
 * Foto del contenido que se carga desde el navegador (bloques y links de los sectores, frentes e
 * iniciativas de Innovación) para llevarlo al repositorio y volver a cargarlo sin duplicar nada.
 *
 * Los archivos subidos desde el portal NO viajan en la foto: solo su ruta (file_path). Los archivos
 * viven en storage/app/public y se respaldan con el volumen del servidor.
 */
class PortalContentSnapshot
{
    public const VERSION = 1;

    /**
     * @return array{version: int, sectores: array<string, array<int, array<string, mixed>>>, frentes: array<int, array<string, mixed>>}
     */
    public function export(): array
    {
        $sectores = [];

        SectorGroup::query()
            ->with('items')
            ->orderBy('sector')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->each(function (SectorGroup $group) use (&$sectores): void {
                $sectores[$group->sector][] = [
                    'title' => $group->title,
                    'items' => $group->items->map(fn (SectorItem $item): array => [
                        'label' => $item->label,
                        'url' => $item->url,
                        'badge' => $item->badge,
                        'keywords' => $item->keywords,
                        'file_path' => $item->file_path,
                    ])->all(),
                ];
            });

        $frentes = Frente::query()
            ->with('iniciativas')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (Frente $frente): array => [
                'area' => $frente->area,
                'owner' => $frente->owner,
                'iniciativas' => $frente->iniciativas->map(fn (Iniciativa $iniciativa): array => [
                    'n' => $iniciativa->n,
                    'badge' => $iniciativa->badge,
                    'cls' => $iniciativa->cls,
                    'desc' => $iniciativa->desc,
                    'url' => $iniciativa->url,
                    'file_path' => $iniciativa->file_path,
                ])->all(),
            ])->all();

        return ['version' => self::VERSION, 'sectores' => $sectores, 'frentes' => $frentes];
    }

    /**
     * Carga la foto. Es idempotente por sector: si el sector ya tiene bloques NO lo toca (salvo
     * $replace), así que correrlo dos veces o sobre un portal ya cargado no duplica ni pisa nada.
     *
     * @param  array<string, mixed>  $snapshot
     * @param  array<int, string>|null  $only  Sectores a cargar ('innovacion' = frentes); null = todos.
     * @return array<string, string> Resultado por sector: 'cargado' u 'omitido (ya tiene contenido)'.
     */
    public function import(array $snapshot, bool $replace = false, ?array $only = null): array
    {
        $result = [];

        DB::transaction(function () use ($snapshot, $replace, $only, &$result): void {
            foreach ($snapshot['sectores'] ?? [] as $sector => $groups) {
                if ($only !== null && ! in_array($sector, $only, true)) {
                    continue;
                }

                if (SectorGroup::query()->where('sector', $sector)->exists() && ! $replace) {
                    $result[$sector] = 'omitido (ya tiene contenido)';

                    continue;
                }

                SectorGroup::query()->where('sector', $sector)->delete();

                foreach ($groups as $groupIndex => $group) {
                    $model = SectorGroup::create([
                        'sector' => $sector,
                        'title' => $group['title'],
                        'sort_order' => $groupIndex,
                    ]);

                    foreach ($group['items'] ?? [] as $itemIndex => $item) {
                        $model->items()->create([
                            'label' => $item['label'],
                            'url' => $item['url'] ?? null,
                            'badge' => $item['badge'] ?? null,
                            'keywords' => $item['keywords'] ?? null,
                            'file_path' => $item['file_path'] ?? null,
                            'sort_order' => $itemIndex,
                        ]);
                    }
                }

                $result[$sector] = 'cargado';
            }

            if (($only === null || in_array('innovacion', $only, true)) && isset($snapshot['frentes'])) {
                if (Frente::query()->exists() && ! $replace) {
                    $result['innovacion'] = 'omitido (ya tiene contenido)';

                    return;
                }

                Frente::query()->delete();

                foreach ($snapshot['frentes'] as $frenteIndex => $frente) {
                    $model = Frente::create([
                        'area' => $frente['area'],
                        'owner' => $frente['owner'] ?? null,
                        'sort_order' => $frenteIndex,
                    ]);

                    foreach ($frente['iniciativas'] ?? [] as $iniciativaIndex => $iniciativa) {
                        $model->iniciativas()->create([
                            'n' => $iniciativa['n'],
                            'badge' => $iniciativa['badge'],
                            'cls' => $iniciativa['cls'],
                            'desc' => $iniciativa['desc'],
                            'url' => $iniciativa['url'] ?? null,
                            'file_path' => $iniciativa['file_path'] ?? null,
                            'sort_order' => $iniciativaIndex,
                        ]);
                    }
                }

                $result['innovacion'] = 'cargado';
            }
        });

        return $result;
    }
}
