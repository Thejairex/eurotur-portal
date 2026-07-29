<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class InnovacionController extends Controller
{
    /**
     * Show the innovation/AI showcase.
     */
    public function __invoke(): Response
    {
        return Inertia::render('portal/innovacion');
    }
}
