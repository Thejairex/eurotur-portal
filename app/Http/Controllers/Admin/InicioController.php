<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Descarga;
use App\Models\Frente;
use App\Models\Iniciativa;
use App\Models\Novedad;
use App\Models\SectorGroup;
use App\Models\SectorItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Inicio del Back Office: el resumen de cada persona. Lo que depende de sus permisos (qué páginas
 * puede editar, qué herramientas tiene) lo resuelve la pantalla con los permisos compartidos;
 * acá solo se calculan los números y las listas.
 */
class InicioController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $leidas = DB::table('novedad_lecturas')->where('user_id', $request->user()->id)->pluck('novedad_id')->all();

        // Bloques y links de cada página (sector) del portal, para "Mis páginas".
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

        return Inertia::render('admin/inicio', [
            'paginas' => $paginas,
            'novedades' => Novedad::query()
                ->orderByDesc('fecha')
                ->orderByDesc('id')
                ->limit(4)
                ->get()
                ->map(fn (Novedad $novedad) => [
                    'id' => $novedad->id,
                    'fecha' => $novedad->fecha->toDateString(),
                    'titulo' => $novedad->titulo,
                    'texto' => $novedad->texto,
                    'nueva' => ! in_array($novedad->id, $leidas, true),
                ]),
            'descargas' => Descarga::query()
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->limit(5)
                ->get()
                ->map(fn (Descarga $descarga) => [
                    'id' => $descarga->id,
                    'nombre' => $descarga->nombre,
                    'extension' => $descarga->extension,
                    'tamano' => $descarga->tamano,
                ]),
        ]);
    }
}
