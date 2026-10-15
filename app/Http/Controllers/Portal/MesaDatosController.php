<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Services\MesaDatosService;
use Illuminate\Http\JsonResponse;

/**
 * Sensores y teléfonos de la Mesa de Información, en JSON. Es público como el resto de las
 * páginas de sector (quien llega al portal ya está dentro de la VPN). La página lo vuelve a
 * pedir cada minuto; el servicio reutiliza la lectura de Google unos segundos.
 */
class MesaDatosController extends Controller
{
    public function __invoke(MesaDatosService $service): JsonResponse
    {
        return response()
            ->json($service->datos())
            ->header('Cache-Control', 'no-store');
    }
}
