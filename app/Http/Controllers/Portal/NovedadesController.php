<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Services\BotService;
use Inertia\Inertia;
use Inertia\Response;

class NovedadesController extends Controller
{
    /**
     * Show the automation pipeline status and recent activity.
     */
    public function __invoke(BotService $bot): Response
    {
        return Inertia::render('portal/novedades', [
            'stats' => fn () => $bot->stats(),
            'history' => fn () => $bot->history(),
        ]);
    }
}
