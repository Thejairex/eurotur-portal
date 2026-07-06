<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PortalTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Avoid real network calls to dolarapi.com from HandleInertiaRequests::share().
        Http::fake([
            'dolarapi.com/*' => Http::response(['venta' => 1510]),
        ]);
    }

    /**
     * @return array<string, array{string}>
     */
    public static function portalRoutes(): array
    {
        return [
            'home' => ['home'],
            'rrhh' => ['portal.rrhh'],
            'institucional' => ['portal.institucional'],
            'adm' => ['portal.adm'],
            'contrataciones' => ['portal.contrataciones'],
            'operaciones' => ['portal.operaciones'],
            'producto' => ['portal.producto'],
            'customercare' => ['portal.customercare'],
            'sales' => ['portal.sales'],
            'traveldesigners' => ['portal.traveldesigners'],
            'it' => ['portal.it'],
            'mesa' => ['portal.mesa'],
            'responsables' => ['portal.responsables'],
        ];
    }

    #[DataProvider('portalRoutes')]
    public function test_portal_pages_are_publicly_accessible(string $routeName): void
    {
        $response = $this->get(route($routeName));

        $response->assertOk();
    }
}
