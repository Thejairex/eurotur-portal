<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\Portal\FrenteResource;
use App\Models\Frente;
use App\Services\BotService;
use Inertia\Inertia;
use Inertia\Response;

class InnovacionController extends Controller
{
    /**
     * Show the innovation/AI showcase plus the live status of the TourPlan CxP bot.
     */
    public function __invoke(BotService $bot): Response
    {
        $frentes = Frente::query()->with('iniciativas')->orderBy('sort_order')->get();

        return Inertia::render('portal/innovacion', [
            'frentes' => FrenteResource::collection($frentes),
            'summary' => fn () => $bot->summary(),
            'stats' => fn () => $bot->stats(),
        ]);
    }
}
