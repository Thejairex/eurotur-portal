<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Support\Mercados;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * «Mercados que gestiona» en Mi perfil: se guardan limpios, viajan al Organigrama y se copian de él.
 */
class MercadosPerfilTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.organigrama.url' => 'http://organigrama.test', 'services.organigrama.token' => 'secreto']);
    }

    public function test_the_list_is_cleaned_without_blanks_or_repeats(): void
    {
        $this->assertSame(['Mercado Italiano', 'Grupos'], Mercados::normalizar(' Mercado  Italiano, ,grupos;GRUPOS'));
        $this->assertSame(['España', 'México'], Mercados::normalizar(['España', ' México ', 'españa', '']));
        $this->assertSame([], Mercados::normalizar(null));
        $this->assertSame(['Texto'], Mercados::normalizar('<b>Texto</b>'));
    }

    public function test_a_person_saves_her_markets_and_they_are_sent_to_the_organigrama(): void
    {
        Http::fake(['organigrama.test/*' => Http::response(['actualizadas' => 1])]);
        $user = User::factory()->viewer()->create(['email' => 'eugenia.meyoyan@eurotur.tur.ar']);

        $this->actingAs($user)
            ->put(route('admin.perfil.update'), ['interno' => '353', 'mercados' => ' Mercado Italiano, Grupos en general ,'])
            ->assertSessionHasNoErrors();

        $this->assertSame(['Mercado Italiano', 'Grupos en general'], $user->fresh()->mercados);
        Http::assertSent(fn ($request) => str_ends_with($request->url(), '/api/interno/mercados')
            && $request->hasHeader('Authorization', 'Bearer secreto')
            && $request['mail'] === 'eugenia.meyoyan@eurotur.tur.ar'
            && $request['mercados'] === ['Mercado Italiano', 'Grupos en general']);
    }

    public function test_the_profile_shows_the_markets(): void
    {
        $user = User::factory()->viewer()->create(['mercados' => ['España', 'Portugal']]);

        $this->actingAs($user)
            ->get(route('admin.perfil'))
            ->assertInertia(fn ($page) => $page->where('perfil.mercados', ['España', 'Portugal']));
    }

    public function test_a_failing_organigrama_never_blocks_saving(): void
    {
        Http::fake(['organigrama.test/*' => Http::response([], 404)]);
        $user = User::factory()->viewer()->create();

        $this->actingAs($user)
            ->put(route('admin.perfil.update'), ['interno' => '1', 'mercados' => 'Italia'])
            ->assertSessionHasNoErrors();

        $this->assertSame(['Italia'], $user->fresh()->mercados);
    }

    public function test_without_the_token_nothing_is_sent_but_the_profile_is_saved(): void
    {
        config(['services.organigrama.token' => '']);
        Http::fake();
        $user = User::factory()->viewer()->create();

        $this->actingAs($user)->put(route('admin.perfil.update'), ['interno' => '1', 'mercados' => 'Italia']);

        $this->assertSame(['Italia'], $user->fresh()->mercados);
        Http::assertNothingSent();
    }

    public function test_a_request_without_the_field_keeps_what_was_loaded_and_sends_nothing(): void
    {
        Http::fake();
        $user = User::factory()->viewer()->create(['mercados' => ['Pegasus']]);

        $this->actingAs($user)->put(route('admin.perfil.update'), ['interno' => '99'])->assertSessionHasNoErrors();

        $this->assertSame(['Pegasus'], $user->fresh()->mercados);
        Http::assertNothingSent();
    }

    public function test_an_empty_field_clears_the_markets_and_tells_the_organigrama(): void
    {
        Http::fake(['organigrama.test/*' => Http::response(['actualizadas' => 1])]);
        $user = User::factory()->viewer()->create(['mercados' => ['Pegasus']]);

        $this->actingAs($user)->put(route('admin.perfil.update'), ['interno' => '1', 'mercados' => ''])->assertSessionHasNoErrors();

        $this->assertSame([], $user->fresh()->mercados);
        Http::assertSent(fn ($request) => $request['mercados'] === []);
    }

    public function test_saving_the_same_markets_does_not_call_the_organigrama(): void
    {
        Http::fake();
        $user = User::factory()->viewer()->create(['mercados' => ['Pegasus']]);

        $this->actingAs($user)->put(route('admin.perfil.update'), ['interno' => '1', 'mercados' => 'Pegasus']);

        Http::assertNothingSent();
    }

    public function test_too_many_or_too_long_markets_are_rejected_in_spanish(): void
    {
        $user = User::factory()->viewer()->create();

        $this->actingAs($user)
            ->put(route('admin.perfil.update'), ['interno' => '1', 'mercados' => implode(',', range(1, 16))])
            ->assertSessionHasErrors(['mercados' => 'Podés cargar hasta 15 mercados.']);

        $this->actingAs($user)
            ->put(route('admin.perfil.update'), ['interno' => '1', 'mercados' => str_repeat('x', 41)])
            ->assertSessionHasErrors('mercados.0');
    }

    public function test_whoever_manages_users_can_complete_another_persons_markets(): void
    {
        Http::fake(['organigrama.test/*' => Http::response(['actualizadas' => 1])]);
        $admin = User::factory()->admin()->create();
        $user = User::factory()->viewer()->create();

        $this->actingAs($admin)
            ->put(route('admin.users.perfil.update', $user), ['interno' => '5', 'mercados' => 'Japón'])
            ->assertSessionHasNoErrors();

        $this->assertSame(['Japón'], $user->fresh()->mercados);
    }

    public function test_a_viewer_cannot_edit_another_persons_profile(): void
    {
        $viewer = User::factory()->viewer()->create();
        $other = User::factory()->viewer()->create();

        $this->actingAs($viewer)
            ->put(route('admin.users.perfil.update', $other), ['interno' => '5', 'mercados' => 'Japón'])
            ->assertForbidden();
    }

    public function test_the_sync_copies_the_markets_from_the_organigrama_only_when_the_person_has_none(): void
    {
        Http::fake(['organigrama.test/*' => Http::response(['quedan_datos_ejemplo' => false, 'personas' => [
            ['mail' => 'vacia@eurotur.tur.ar', 'puesto' => 'A', 'sector' => 'Operaciones', 'sede' => 'Tucumán', 'interno' => '1', 'mercados' => ['España', 'Portugal'], 'datos_ejemplo' => false],
            ['mail' => 'cargada@eurotur.tur.ar', 'puesto' => 'B', 'sector' => 'Operaciones', 'sede' => 'Tucumán', 'interno' => '2', 'mercados' => ['Francia'], 'datos_ejemplo' => false],
        ]])]);
        $vacia = User::factory()->viewer()->create(['email' => 'vacia@eurotur.tur.ar']);
        $cargada = User::factory()->viewer()->create(['email' => 'cargada@eurotur.tur.ar', 'mercados' => ['Italia']]);

        $this->artisan('organigrama:sincronizar', ['--aplicar' => true])->assertSuccessful();

        $this->assertSame(['España', 'Portugal'], $vacia->fresh()->mercados);
        $this->assertSame(['Italia'], $cargada->fresh()->mercados);
    }
}
