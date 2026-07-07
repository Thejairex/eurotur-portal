<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class BotService
{
    /**
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
