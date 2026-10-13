<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OrganigramaVerRedirectController extends Controller
{
    /**
     * Public, read-only entry to the Organigrama app. A stable portal URL
     * (/organigrama) that the RRHH and Travel Designers sectors and the search
     * link to, so the app's real address lives in config (ORGANIGRAMA_URL) and
     * not in the editable sector content. The query string (?empresa=TD, ...)
     * is passed through to the app. The destination is always the configured
     * URL, never taken from the request.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $destino = rtrim((string) config('services.organigrama.url'), '/').'/';
        $query = $request->getQueryString();

        return redirect()->away($query === null || $query === '' ? $destino : $destino.'?'.$query);
    }
}
