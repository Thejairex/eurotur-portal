<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Services\OrganigramaSync;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Sincronización del perfil con el Organigrama (organigrama:sincronizar).
 */
class OrganigramaSyncTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.organigrama.url' => 'http://organigrama.test', 'services.organigrama.token' => 'secreto']);
    }

    /**
     * @param  list<array<string, mixed>>  $personas
     */
    private function fakeOrganigrama(array $personas): void
    {
        Http::fake(['organigrama.test/*' => Http::response(['quedan_datos_ejemplo' => false, 'personas' => $personas])]);
    }

    /**
     * @return array<string, mixed>
     */
    private function persona(string $mail, array $extra = []): array
    {
        return [...[
            'mail' => $mail, 'puesto' => 'Analista', 'sector' => 'Operaciones', 'sede' => 'Tucumán',
            'interno' => '301 / cel 401', 'datos_ejemplo' => false,
        ], ...$extra];
    }

    public function test_simulation_writes_nothing(): void
    {
        $user = User::factory()->create(['email' => 'ana@eurotur.tur.ar']);
        $this->fakeOrganigrama([$this->persona('ana@eurotur.tur.ar')]);

        $this->artisan('organigrama:sincronizar')->assertSuccessful()->expectsOutputToContain('SIMULACIÓN');

        $user = $user->fresh();
        $this->assertNull($user->puesto);
        $this->assertNull($user->organigrama_sync_at);
        Http::assertSent(fn ($request) => $request->hasHeader('Authorization', 'Bearer secreto'));
    }

    public function test_apply_copies_puesto_area_sede_and_marks_the_sync(): void
    {
        $user = User::factory()->create(['email' => 'ana@eurotur.tur.ar', 'puesto' => 'Viejo', 'sede' => 'Salta']);
        $this->fakeOrganigrama([$this->persona('Ana@Eurotur.tur.ar ')]);

        $this->artisan('organigrama:sincronizar', ['--aplicar' => true])->assertSuccessful();

        $user = $user->fresh();
        $this->assertSame('Analista', $user->puesto);
        $this->assertSame('Operaciones', $user->area);
        $this->assertSame('Tucumán', $user->sede);
        $this->assertSame('301 / cel 401', $user->interno);
        $this->assertNotNull($user->organigrama_sync_at);
    }

    public function test_interno_is_only_copied_when_the_person_has_none(): void
    {
        $user = User::factory()->create(['email' => 'ana@eurotur.tur.ar', 'interno' => '999']);
        $this->fakeOrganigrama([$this->persona('ana@eurotur.tur.ar')]);

        $this->artisan('organigrama:sincronizar', ['--aplicar' => true])->assertSuccessful();

        $this->assertSame('999', $user->fresh()->interno);
    }

    public function test_people_with_example_data_and_unknown_mails_are_left_alone(): void
    {
        $user = User::factory()->create(['email' => 'ana@eurotur.tur.ar']);
        $this->fakeOrganigrama([
            $this->persona('ana@eurotur.tur.ar', ['datos_ejemplo' => true]),
            $this->persona('nadie@eurotur.tur.ar'),
        ]);

        $this->artisan('organigrama:sincronizar', ['--aplicar' => true])
            ->assertSuccessful()
            ->expectsOutputToContain('nadie@eurotur.tur.ar');

        $this->assertNull($user->fresh()->puesto);
        $this->assertNull($user->fresh()->organigrama_sync_at);
    }

    public function test_the_same_mail_with_different_data_is_ambiguous_and_skipped(): void
    {
        $user = User::factory()->create(['email' => 'ana@eurotur.tur.ar']);
        $this->fakeOrganigrama([
            $this->persona('ana@eurotur.tur.ar'),
            $this->persona('ana@eurotur.tur.ar', ['puesto' => 'Otro']),
        ]);

        $this->artisan('organigrama:sincronizar', ['--aplicar' => true])->assertSuccessful();

        $this->assertNull($user->fresh()->puesto);
    }

    public function test_it_fails_cleanly_without_token(): void
    {
        config(['services.organigrama.token' => '']);

        $this->artisan('organigrama:sincronizar')->assertFailed()->expectsOutputToContain('ORGANIGRAMA_TOKEN_INTERNO');
    }

    public function test_it_fails_cleanly_when_the_organigrama_route_is_disabled(): void
    {
        Http::fake(['organigrama.test/*' => Http::response([], 404)]);

        $this->artisan('organigrama:sincronizar')->assertFailed();
    }

    public function test_profile_shows_when_it_was_last_synced(): void
    {
        $user = User::factory()->create(['organigrama_sync_at' => '2026-10-23 12:00:00']);

        $this->actingAs($user)
            ->get(route('admin.perfil'))
            ->assertInertia(fn ($page) => $page->where('organigramaSync', fn ($value) => str_starts_with((string) $value, '2026-10-23')));
    }

    public function test_the_profile_photo_is_also_sent_to_the_organigrama(): void
    {
        Http::fake(['organigrama.test/*' => Http::response(['actualizadas' => 1])]);
        $user = User::factory()->create(['email' => 'ana@eurotur.tur.ar']);

        $this->assertTrue(app(OrganigramaSync::class)->enviarFoto($user, 'contenido-de-la-foto'));

        Http::assertSent(fn ($request) => str_ends_with($request->url(), '/api/interno/foto')
            && $request->hasHeader('Authorization', 'Bearer secreto'));
    }

    public function test_a_failing_organigrama_never_breaks_the_photo_upload(): void
    {
        Http::fake(['organigrama.test/*' => Http::response([], 404)]);
        $user = User::factory()->create(['email' => 'ana@eurotur.tur.ar']);

        $this->assertFalse(app(OrganigramaSync::class)->enviarFoto($user, 'x'));

        config(['services.organigrama.token' => '']);
        $this->assertFalse(app(OrganigramaSync::class)->enviarFoto($user, 'x'));
    }
}
