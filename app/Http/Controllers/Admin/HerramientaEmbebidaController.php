<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\HerramientasExternas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HerramientaEmbebidaController extends Controller
{
    /**
     * Muestra una herramienta externa DENTRO del Back Office: misma pestaña, menú del Back
     * Office al costado y la herramienta en un marco. Mismo permiso que abrirla directo: la
     * herramienta además valida la sesión por su cuenta (proxy + HerramientaSessionController),
     * así que esto no es la única barrera.
     */
    public function __invoke(Request $request, string $herramienta): Response
    {
        $datos = HerramientasExternas::buscar($herramienta);

        abort_if($datos === null, 404);
        abort_unless($request->user()?->can($datos['permission']->value), 403);

        return Inertia::render('admin/herramientas/embebida', [
            'label' => $datos['label'],
            'area' => $datos['area'],
            'src' => HerramientasExternas::url($herramienta, embebido: true),
            'abrirEn' => HerramientasExternas::url($herramienta),
        ]);
    }
}
