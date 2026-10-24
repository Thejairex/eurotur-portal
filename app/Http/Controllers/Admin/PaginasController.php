<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PaginasResumen;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Editar páginas": la lista de páginas del portal que la persona puede editar. Cada una lleva a la
 * página real con la edición ya abierta; lo que se puede tocar lo decide el permiso de cada sector.
 */
class PaginasController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/paginas', ['paginas' => PaginasResumen::conteos()]);
    }
}
