<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class BalanzRedirectController extends Controller
{
    /**
     * Sends the browser to the externally-hosted Generador de Asientos Balanz.
     * The tool sits behind a proxy that validates the portal session, so the
     * user lands on it already identified.
     */
    public function __invoke(): RedirectResponse
    {
        return redirect()->away(config('services.balanz.url'));
    }
}
