<?php

namespace Tests\Feature\Portal;

use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MesaDatosTest extends TestCase
{
    use RefreshDatabase;

    private string $credenciales;

    protected function setUp(): void
    {
        parent::setUp();

        // Cuenta de servicio de mentira, con una clave RSA real para poder firmar el token.
        $clave = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($clave, $privada);

        $this->credenciales = tempnam(sys_get_temp_dir(), 'mesa');
        file_put_contents($this->credenciales, json_encode([
            'client_email' => 'robot@proyecto.iam.gserviceaccount.com',
            'private_key' => $privada,
        ]));

        config([
            'services.mesa.datos_ejemplo' => false,
            'services.mesa.credenciales' => $this->credenciales,
            'services.mesa.sensores_sheet_id' => 'SENSORES',
            'services.mesa.telefonos_sheet_id' => 'TELEFONOS',
        ]);
    }

    protected function tearDown(): void
    {
        @unlink($this->credenciales);

        parent::tearDown();
    }

    private function fingirGoogle(): void
    {
        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(['access_token' => 'tok']),
            'sheets.googleapis.com/v4/spreadsheets/SENSORES/*' => Http::response(['values' => [
                ['🌡 Estado de Sensores en Tiempo Real'],
                ['Sensor', 'Temperatura (°C)', 'Humedad (%)', 'Estado'],
                ['Frente', '21,7', '64', 'FUERA DE RANGO'],
                ['Contrafrente', '22', '63', 'OK'],
                ['Ultima actualizacion: 2026-10-15 13:40'],
            ]]),
            'sheets.googleapis.com/v4/spreadsheets/TELEFONOS/*' => Http::response(['values' => [
                ['Telefonos Eurotur', 'Numeros'],
                ['Operadora', '1155666250'],
                ['Guardias', '1168781562'],
                ['', ''],
            ]]),
        ]);
    }

    public function test_it_reads_the_sensors_and_phones_from_the_sheets_without_login(): void
    {
        $this->travelTo(CarbonImmutable::parse('2026-10-15 13:50', 'America/Argentina/Buenos_Aires'));
        $this->fingirGoogle();

        $this->getJson(route('portal.mesa.datos'))
            ->assertOk()
            ->assertJsonPath('modo', 'vivo')
            ->assertJsonCount(2, 'sensores')
            ->assertJsonPath('sensores.0.nombre', 'Frente')
            ->assertJsonPath('sensores.0.temperatura', 21.7)
            ->assertJsonPath('sensores.0.humedad', 64)
            ->assertJsonPath('sensores.0.nivel', 'alerta')
            ->assertJsonPath('sensores.1.nivel', 'ok')
            ->assertJsonPath('actualizado', '2026-10-15T13:40:00-03:00')
            ->assertJsonPath('desactualizado', false)
            ->assertJsonCount(2, 'telefonos')
            ->assertJsonPath('telefonos.0', ['nombre' => 'Operadora', 'numero' => '1155666250']);
    }

    public function test_it_asks_google_with_a_signed_token_and_the_read_only_scope(): void
    {
        $this->fingirGoogle();

        $this->getJson(route('portal.mesa.datos'))->assertOk();

        Http::assertSent(fn (Request $request) => $request->url() === 'https://oauth2.googleapis.com/token'
            && $request['grant_type'] === 'urn:ietf:params:oauth:grant-type:jwt-bearer'
            && count(explode('.', $request['assertion'])) === 3);

        Http::assertSent(fn (Request $request) => str_starts_with($request->url(), 'https://sheets.googleapis.com/v4/spreadsheets/SENSORES/values/')
            && $request->hasHeader('Authorization', 'Bearer tok'));
    }

    public function test_it_warns_when_the_sensors_have_not_been_updated_for_a_while(): void
    {
        $this->travelTo(CarbonImmutable::parse('2026-10-15 15:00', 'America/Argentina/Buenos_Aires'));
        $this->fingirGoogle();

        $this->getJson(route('portal.mesa.datos'))
            ->assertOk()
            ->assertJsonPath('desactualizado', true);
    }

    public function test_it_reuses_the_reading_instead_of_calling_google_on_every_visit(): void
    {
        $this->fingirGoogle();

        $this->getJson(route('portal.mesa.datos'))->assertOk();
        $this->getJson(route('portal.mesa.datos'))->assertOk();

        // 1 token + 1 hoja de sensores + 1 hoja de telefonos, una sola vez.
        Http::assertSentCount(3);
    }

    public function test_it_reports_an_error_without_breaking_when_google_fails(): void
    {
        Http::fake(['oauth2.googleapis.com/token' => Http::response('boom', 500)]);

        $this->getJson(route('portal.mesa.datos'))
            ->assertOk()
            ->assertJsonPath('modo', 'error')
            ->assertJsonPath('sensores', [])
            ->assertJsonPath('telefonos', []);
    }

    public function test_it_says_not_configured_when_there_are_no_credentials(): void
    {
        config(['services.mesa.credenciales' => null]);
        Http::fake();

        $this->getJson(route('portal.mesa.datos'))
            ->assertOk()
            ->assertJsonPath('modo', 'no-configurado');

        Http::assertNothingSent();
    }

    public function test_example_mode_returns_fictitious_data_without_touching_google(): void
    {
        config(['services.mesa.datos_ejemplo' => true]);
        Http::fake();

        $this->getJson(route('portal.mesa.datos'))
            ->assertOk()
            ->assertJsonPath('modo', 'ejemplo')
            ->assertJsonPath('desactualizado', false);

        Http::assertNothingSent();
    }

    public function test_the_mesa_page_still_renders(): void
    {
        $this->get(route('portal.mesa'))->assertOk();
    }
}
