<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Services\BotService;
use Inertia\Inertia;
use Inertia\Response;

class InnovacionController extends Controller
{
    /**
     * Show the innovation/AI showcase plus the live automation pipeline status.
     */
    public function __invoke(BotService $bot): Response
    {
        return Inertia::render('portal/innovacion', [
            'summary' => fn () => $bot->summary(),
            'stats' => fn () => $bot->stats(),
            'history' => fn () => $bot->history(),
        ]);
    }
}
