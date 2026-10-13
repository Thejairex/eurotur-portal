<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class BigBrotherRedirectController extends Controller
{
    /**
     * Sends the browser to the externally-hosted Big Brother panel. The panel
     * sits behind a proxy that validates the portal session
     * (see HerramientaSessionController), so the user lands on it already
     * identified.
     */
    public function __invoke(): RedirectResponse
    {
        return redirect()->away(config('services.big_brother.url'));
    }
}
