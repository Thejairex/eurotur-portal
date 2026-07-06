<?php

namespace Tests\Unit;

use App\Services\DolarOficialService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DolarOficialServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Cache::forget('dolar-oficial-venta');
    }

    public function test_it_returns_the_venta_price_from_a_successful_response(): void
    {
        Http::fake([
            'dolarapi.com/*' => Http::response(['moneda' => 'USD', 'casa' => 'oficial', 'venta' => 1510, 'compra' => 1460]),
        ]);

        $venta = app(DolarOficialService::class)->ventaOficial();

        $this->assertSame(1510.0, $venta);
    }

    public function test_it_caches_the_result_so_the_api_is_called_only_once(): void
    {
        Http::fake([
            'dolarapi.com/*' => Http::response(['venta' => 1510]),
        ]);

        $service = app(DolarOficialService::class);
        $service->ventaOficial();
        $service->ventaOficial();

        Http::assertSentCount(1);
    }

    public function test_it_returns_null_and_does_not_cache_on_a_failed_response(): void
    {
        Http::fake([
            'dolarapi.com/*' => Http::response(null, 500),
        ]);

        $service = app(DolarOficialService::class);

        $this->assertNull($service->ventaOficial());
        $this->assertNull($service->ventaOficial());
        Http::assertSentCount(2);
    }
}
