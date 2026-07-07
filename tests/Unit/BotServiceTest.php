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
            'euroturbot-monitor:8000/api/stats' => Http::response(['state' => 'running', 'stats' => ['progress_pct' => 50]]),
        ]);

        $stats = app(BotService::class)->stats();

        $this->assertSame('running', $stats['state']);
    }

    public function test_it_returns_null_stats_when_no_run_is_active(): void
    {
        Http::fake([
            'euroturbot-monitor:8000/api/stats' => Http::response(null),
        ]);

        $this->assertNull(app(BotService::class)->stats());
    }

    public function test_it_returns_summary_from_a_successful_response(): void
    {
        Http::fake([
            'euroturbot-monitor:8000/api/summary' => Http::response([
                'vouchers' => ['pending' => 1, 'processing' => 0, 'ok' => 2, 'failed' => 0, 'skipped' => 0, 'total' => 3],
                'cheques' => ['pending' => 0, 'ok' => 1, 'failed' => 0, 'total' => 1],
            ]),
        ]);

        $summary = app(BotService::class)->summary();

        $this->assertSame(3, $summary['vouchers']['total']);
    }

    public function test_it_returns_null_summary_on_a_failed_response(): void
    {
        Http::fake([
            'euroturbot-monitor:8000/*' => Http::response(null, 500),
        ]);

        $this->assertNull(app(BotService::class)->summary());
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
