<?php

namespace Tests\Feature\Portal;

use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NovedadesTest extends TestCase
{
    private const SUMMARY_RESPONSE = [
        'vouchers' => ['pending' => 5, 'processing' => 0, 'ok' => 10, 'failed' => 1, 'skipped' => 2, 'total' => 18],
        'cheques' => ['pending' => 0, 'ok' => 3, 'failed' => 0, 'total' => 3],
    ];

    public function test_it_shows_the_summary_and_active_run_and_history(): void
    {
        Http::fake([
            'euroturbot-monitor:8000/api/summary' => Http::response(self::SUMMARY_RESPONSE),
            'euroturbot-monitor:8000/api/stats' => Http::response([
                'state' => 'running',
                'mode' => 'full',
                'thread_alive' => true,
                'heartbeat_age' => 1.2,
                'stats' => ['running' => true, 'finished' => false, 'error' => null, 'total' => 10, 'ok' => 8, 'failed' => 1, 'skipped' => 1, 'progress_pct' => 80.0, 'elapsed_seconds' => 30.0],
            ]),
            'euroturbot-monitor:8000/api/history*' => Http::response([
                'vouchers' => [
                    ['seq' => 1, 'ts' => '14:03:22', 'supplier_code' => 'ACME', 'voucher' => 'A-0001', 'currency' => 'USD', 'status' => 'ok', 'error' => ''],
                ],
                'total' => 1,
                'has_more' => false,
            ]),
        ]);

        $response = $this->get(route('portal.novedades'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('portal/novedades')
            ->where('summary.vouchers.total', 18)
            ->where('stats.state', 'running')
            ->where('history.vouchers.0.supplier_code', 'ACME')
        );
    }

    public function test_it_shows_the_summary_without_an_active_run(): void
    {
        Http::fake([
            'euroturbot-monitor:8000/api/summary' => Http::response(self::SUMMARY_RESPONSE),
            'euroturbot-monitor:8000/api/stats' => Http::response(null),
            'euroturbot-monitor:8000/api/history*' => Http::response(['vouchers' => [], 'total' => 0, 'has_more' => false]),
        ]);

        $response = $this->get(route('portal.novedades'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('portal/novedades')
            ->where('summary.vouchers.total', 18)
            ->where('stats', null)
        );
    }

    public function test_it_degrades_gracefully_when_the_monitor_is_unreachable(): void
    {
        Http::fake([
            'euroturbot-monitor:8000/*' => Http::response(null, 500),
        ]);

        $response = $this->get(route('portal.novedades'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('portal/novedades')
            ->where('summary', null)
            ->where('stats', null)
            ->where('history', null)
        );
    }
}
