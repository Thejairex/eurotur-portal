<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNovedadRequest;
use App\Models\Novedad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Novedades del sistema. Todas las personas las leen; quien tiene el permiso `novedades.manage`
 * las crea, edita y borra. Al abrir la lista se marcan como leídas, pero esa pantalla todavía
 * muestra cuáles eran nuevas.
 */
class NovedadController extends Controller
{
    public function index(Request $request): Response
    {
        $usuario = $request->user();
        $leidas = DB::table('novedad_lecturas')->where('user_id', $usuario->id)->pluck('novedad_id')->all();

        $novedades = Novedad::query()
            ->orderByDesc('fecha')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Novedad $novedad) => [
                'id' => $novedad->id,
                'fecha' => $novedad->fecha->toDateString(),
                'titulo' => $novedad->titulo,
                'texto' => $novedad->texto,
                'nueva' => ! in_array($novedad->id, $leidas, true),
            ]);

        $sinLeer = $novedades->where('nueva', true)->pluck('id');

        if ($sinLeer->isNotEmpty()) {
            DB::table('novedad_lecturas')->insertOrIgnore(
                $sinLeer->map(fn (int $id) => [
                    'novedad_id' => $id,
                    'user_id' => $usuario->id,
                    'leida_at' => now(),
                ])->all(),
            );
        }

        return Inertia::render('admin/novedades', [
            'novedades' => $novedades->values(),
            'puedeAdministrar' => $usuario->can(Permission::NovedadesManage->value),
        ]);
    }

    public function store(StoreNovedadRequest $request): RedirectResponse
    {
        Novedad::create([...$request->validated(), 'creado_por' => $request->user()->id]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Novedad publicada.')]);

        return back();
    }

    public function update(StoreNovedadRequest $request, Novedad $novedad): RedirectResponse
    {
        $novedad->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Novedad actualizada.')]);

        return back();
    }

    public function destroy(Novedad $novedad): RedirectResponse
    {
        $novedad->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Novedad eliminada.')]);

        return back();
    }
}
