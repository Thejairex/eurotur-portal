<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class OrganigramaEditarRedirectController extends Controller
{
    /**
     * Sends the browser to the editing screen of the externally-hosted Organigrama
     * app. The app sits behind a proxy that validates the portal session and the
     * `organigrama.editar` permission (see HerramientaSessionController), so the
     * user lands there already identified and the change log records who they are.
     */
    public function __invoke(): RedirectResponse
    {
        return redirect()->away(rtrim((string) config('services.organigrama.url'), '/').'/editar');
    }
}
