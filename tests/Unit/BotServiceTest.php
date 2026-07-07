<?php

namespace Tests\Unit;

use App\Services\BotService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class BotServiceTest extends TestCase
{
    public function test_it_returns_stats_from_a_successful_response(): void
    {
        Http::fake([
            'euroturbot-monitor:8000/api/stats' => Http::response(['state' => 'idle', 'stats' => null]),
        ]);

        $stats = app(BotService::class)->stats();

        $this->assertSame('idle', $stats['state']);
    }

    public function test_it_sends_the_api_key_header(): void
    {
        config(['services.bot_monitor.api_key' => 'secret-key']);

        Http::fake([
            'euroturbot-monitor:8000/*' => Http::response(['state' => 'idle']),
        ]);

        app(BotService::class)->stats();

        Http::assertSent(fn ($request) => $request->hasHeader('X-API-Key', 'secret-key'));
    }

    public function test_it_returns_null_on_a_failed_response(): void
    {
        Http::fake([
            'euroturbot-monitor:8000/*' => Http::response(null, 500),
        ]);

        $this->assertNull(app(BotService::class)->stats());
    }

    public function test_it_returns_null_when_the_connection_fails(): void
    {
        Http::fake(function () {
            throw new ConnectionException('Connection refused');
        });

        $this->assertNull(app(BotService::class)->stats());
        $this->assertNull(app(BotService::class)->history());
    }
}
