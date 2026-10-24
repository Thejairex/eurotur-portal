<?php

namespace App\Services;

use App\Models\Frente;
use App\Models\Iniciativa;
use App\Models\SectorGroup;
use App\Models\SectorItem;

/**
 * Cuántos bloques y links tiene cada página del portal, para "Mis páginas" (Inicio) y "Editar páginas".
 */
class PaginasResumen
{
    /**
     * @return array<string, array{bloques: int, links: int}>
     */
    public static function conteos(): array
    {
        $bloques = SectorGroup::query()
            ->selectRaw('sector, count(*) as total')
            ->groupBy('sector')
            ->pluck('total', 'sector');
        $links = SectorItem::query()
            ->join('sector_groups', 'sector_groups.id', '=', 'sector_items.sector_group_id')
            ->selectRaw('sector_groups.sector as sector, count(*) as total')
            ->groupBy('sector_groups.sector')
            ->pluck('total', 'sector');

        $paginas = [];

        foreach ($bloques->keys()->merge($links->keys())->unique() as $sector) {
            $paginas[$sector] = [
                'bloques' => (int) ($bloques[$sector] ?? 0),
                'links' => (int) ($links[$sector] ?? 0),
            ];
        }

        // Innovación se arma con frentes e iniciativas en lugar de bloques y links.
        $paginas['innovacion'] = ['bloques' => Frente::query()->count(), 'links' => Iniciativa::query()->count()];

        return $paginas;
    }
}
