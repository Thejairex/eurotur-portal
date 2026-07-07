<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class BotService
{
    /**
     * Persistent totals from the database (vouchers/cheques by status).
     * Always available, regardless of whether a run is currently active —
     * used as the connectivity signal, since /api/stats legitimately
     * returns null whenever nothing is running.
     *
     * @return array<string, mixed>|null
     */
    public function summary(): ?array
    {
        return $this->get('/api/summary');
    }

    /**
     * Progress of the currently active run. Null whenever nothing is
     * running — that is not a failure, see summary() above.
     *
     * @return array<string, mixed>|null
     */
    public function stats(): ?array
    {
        return $this->get('/api/stats');
    }

    /**
     * @return array<string, mixed>|null
     */
    public function history(int $limit = 20): ?array
    {
        return $this->get('/api/history', ['limit' => $limit, 'offset' => 0]);
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>|null
     */
    private function get(string $path, array $query = []): ?array
    {
        try {
            $response = Http::withHeaders(['X-API-Key' => config('services.bot_monitor.api_key')])
                ->baseUrl(config('services.bot_monitor.url'))
                ->timeout(5)
                ->get($path, $query);
        } catch (ConnectionException) {
            return null;
        }

        return $response->successful() ? $response->json() : null;
    }
}
