<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Descarga;
use App\Models\Novedad;
use App\Services\PaginasResumen;
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

        $paginas = PaginasResumen::conteos();

        return Inertia::render('admin/inicio', [
            'paginas' => $paginas,
            'descargasTotal' => Descarga::query()->count(),
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
