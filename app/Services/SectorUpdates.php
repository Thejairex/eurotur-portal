<?php

namespace App\Services;

use App\Models\SectorUpdate;
use Illuminate\Support\Facades\Cache;

/**
 * Fecha real de la última modificación de cada sector, para el "actualizado ..." del pie.
 * Se anota cada vez que alguien agrega, cambia o borra algo de la página.
 */
class SectorUpdates
{
    private const CACHE_KEY = 'sector-updates';

    /** Anota que la página del sector acaba de modificarse, con la persona que la modificó. */
    public static function registrar(string $sector): void
    {
        SectorUpdate::query()->updateOrCreate(
            ['sector' => $sector],
            ['edited_by_name' => auth()->user()?->name, 'edited_at' => now()],
        );

        Cache::forget(self::CACHE_KEY);
    }

    /**
     * @return array<string, array{en: string, por: string|null}>
     */
    public static function todos(): array
    {
        return Cache::remember(self::CACHE_KEY, 60, function (): array {
            $todos = [];

            foreach (SectorUpdate::query()->get() as $update) {
                $todos[$update->sector] = [
                    'en' => $update->edited_at->toIso8601String(),
                    'por' => $update->edited_by_name,
                ];
            }

            return $todos;
        });
    }
}
