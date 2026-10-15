<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Marca que el usuario terminó un recorrido guiado ("portal" o "backoffice"). Solo se guarda la
 * primera vez: una segunda llamada no pisa la fecha original.
 */
class OnboardingCompleteController extends Controller
{
    /** Recorrido => columna de users donde se guarda cuándo lo terminó. */
    public const COLUMNS = [
        'portal' => 'portal_tour_completed_at',
        'backoffice' => 'backoffice_tour_completed_at',
    ];

    public function __invoke(Request $request, string $tour): RedirectResponse
    {
        $column = self::COLUMNS[$tour];
        $user = $request->user();

        if ($user->{$column} === null) {
            $user->forceFill([$column => now()])->save();
        }

        return back();
    }
}
