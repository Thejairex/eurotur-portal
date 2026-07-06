<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class DolarOficialService
{
    private const CACHE_KEY = 'dolar-oficial-venta';

    private const CACHE_TTL_MINUTES = 15;

    /**
     * Fetch the official USD sell price from dolarapi.com, cached to avoid
     * hitting the third-party API on every request.
     */
    public function ventaOficial(): ?float
    {
        if (Cache::has(self::CACHE_KEY)) {
            return Cache::get(self::CACHE_KEY);
        }

        $venta = $this->fetchVenta();

        // Only cache successful responses so a temporary outage doesn't
        // suppress the real value for the full TTL once the API recovers.
        if ($venta !== null) {
            Cache::put(self::CACHE_KEY, $venta, now()->addMinutes(self::CACHE_TTL_MINUTES));
        }

        return $venta;
    }

    /**
     * Runs on every request via HandleInertiaRequests::share(), so any
     * network failure (timeout, DNS, refused connection) must be swallowed
     * here instead of bubbling up and breaking every page in the app.
     */
    private function fetchVenta(): ?float
    {
        try {
            $response = Http::timeout(5)->get('https://dolarapi.com/v1/dolares/oficial');
        } catch (ConnectionException) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $venta = $response->json('venta');

        return is_numeric($venta) ? (float) $venta : null;
    }
}
