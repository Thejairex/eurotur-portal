<?php

namespace Tests\Feature\Admin;

use App\Models\Descarga;
use App\Models\Novedad;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Back Office, fase 2: Mi perfil, Novedades y Descargas.
 */
class BackofficeFase2Test extends TestCase
{
    use RefreshDatabase;

    /** Un webp liso de 80 × 80 px y otro de 8 × 8 px, para probar las medidas de la foto. */
    private const WEBP_80 = 'UklGRlYAAABXRUJQVlA4IEoAAAAQBACdASpQAFAAPrVaqVAnJSOioUgA4BaJaQAACfGjTXzrM+v/M2bNEAD+694v+DZIpzl//+Wf/7Lf9lvCbETrPIMivthAAAAAAA==';

    private const WEBP_8 = 'UklGRjgAAABXRUJQVlA4ICwAAACQAQCdASoIAAgAAoBCJaACdLoAA5gA/u7T36+AKeqP/qDP/IM/8gz9PAAAAA==';

    private function webp(string $base64, string $nombre = 'foto.webp'): UploadedFile
    {
        $ruta = tempnam(sys_get_temp_dir(), 'webp');
        file_put_contents($ruta, base64_decode($base64));

        return new UploadedFile($ruta, $nombre, 'image/webp', null, true);
    }

    // ---------------------------------------------------------------- perfil

    public function test_a_person_updates_their_own_interno_but_not_puesto_without_permission(): void
    {
        $user = User::factory()->viewer()->create(['puesto' => 'Analista']);

        $this->actingAs($user)
            ->put(route('admin.perfil.update'), ['interno' => '1234', 'puesto' => 'Gerente', 'area' => 'X', 'sede' => 'Y'])
            ->assertSessionHasNoErrors();

        $user = $user->fresh();
        $this->assertSame('1234', $user->interno);
        $this->assertSame('Analista', $user->puesto);
        $this->assertNull($user->area);
    }

    public function test_an_administrator_can_update_puesto_area_and_sede(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->put(route('admin.perfil.update'), ['puesto' => 'Analista', 'area' => 'Administración', 'sede' => 'Buenos Aires', 'interno' => '55'])
            ->assertSessionHasNoErrors();

        $admin = $admin->fresh();
        $this->assertSame('Analista', $admin->puesto);
        $this->assertSame('Administración', $admin->area);
        $this->assertSame('Buenos Aires', $admin->sede);
    }

    public function test_profile_text_is_cleaned_and_validated(): void
    {
        $user = User::factory()->viewer()->create();

        $this->actingAs($user)
            ->put(route('admin.perfil.update'), ['interno' => '<b>12</b>34'])
            ->assertSessionHasNoErrors();
        $this->assertSame('1234', $user->fresh()->interno);

        $this->actingAs($user)
            ->put(route('admin.perfil.update'), ['interno' => '12;DROP'])
            ->assertSessionHasErrors('interno');
    }

    public function test_a_person_cannot_open_or_change_someone_elses_profile(): void
    {
        $viewer = User::factory()->viewer()->create();
        $other = User::factory()->create();

        $this->actingAs($viewer)->get(route('admin.users.perfil.show', $other))->assertForbidden();
        $this->actingAs($viewer)->put(route('admin.users.perfil.update', $other), ['interno' => '9'])->assertForbidden();
    }

    public function test_an_administrator_can_correct_another_persons_profile(): void
    {
        $admin = User::factory()->admin()->create();
        $other = User::factory()->viewer()->create();

        $this->actingAs($admin)->get(route('admin.users.perfil.show', $other))->assertOk();
        $this->actingAs($admin)
            ->put(route('admin.users.perfil.update', $other), ['puesto' => 'Contadora', 'interno' => '77'])
            ->assertSessionHasNoErrors();

        $this->assertSame('Contadora', $other->fresh()->puesto);
    }

    public function test_a_valid_photo_is_stored_and_replaces_the_previous_one(): void
    {
        Storage::fake('public');
        $user = User::factory()->viewer()->create();

        $this->actingAs($user)->post(route('admin.perfil.foto'), ['foto' => $this->webp(self::WEBP_80)])
            ->assertSessionHasNoErrors();

        $primera = $user->fresh()->foto_path;
        $this->assertNotNull($primera);
        Storage::disk('public')->assertExists($primera);

        $this->actingAs($user->fresh())->post(route('admin.perfil.foto'), ['foto' => $this->webp(self::WEBP_80)]);

        $segunda = $user->fresh()->foto_path;
        $this->assertNotSame($primera, $segunda);
        Storage::disk('public')->assertMissing($primera);
        Storage::disk('public')->assertExists($segunda);
    }

    public function test_the_photo_is_rejected_when_it_is_not_webp_or_it_is_too_small(): void
    {
        Storage::fake('public');
        $user = User::factory()->viewer()->create();

        $this->actingAs($user)
            ->post(route('admin.perfil.foto'), ['foto' => UploadedFile::fake()->image('foto.png', 100, 100)])
            ->assertSessionHasErrors('foto');

        $this->actingAs($user)
            ->post(route('admin.perfil.foto'), ['foto' => $this->webp(self::WEBP_8)])
            ->assertSessionHasErrors('foto');

        $this->assertNull($user->fresh()->foto_path);
    }

    public function test_the_photo_can_be_removed(): void
    {
        Storage::fake('public');
        $user = User::factory()->viewer()->create();

        $this->actingAs($user)->post(route('admin.perfil.foto'), ['foto' => $this->webp(self::WEBP_80)]);
        $ruta = $user->fresh()->foto_path;

        $this->actingAs($user->fresh())->delete(route('admin.perfil.foto.quitar'));

        $this->assertNull($user->fresh()->foto_path);
        Storage::disk('public')->assertMissing($ruta);
    }

    // ------------------------------------------------------------- novedades

    public function test_the_first_novedades_are_loaded_by_the_migration(): void
    {
        $this->assertGreaterThanOrEqual(4, Novedad::count());
    }

    public function test_novedades_are_new_until_the_person_sees_them(): void
    {
        $user = User::factory()->viewer()->create();
        $total = Novedad::count();

        $this->actingAs($user)->get(route('admin.inicio'))
            ->assertInertia(fn ($page) => $page->where('novedadesSinLeer', $total));

        $this->actingAs($user)->get(route('admin.novedades'))
            ->assertInertia(fn ($page) => $page->component('admin/novedades')->where('novedades.0.nueva', true));

        $this->actingAs($user)->get(route('admin.novedades'))
            ->assertInertia(fn ($page) => $page->where('novedades.0.nueva', false));

        $this->actingAs($user)->get(route('admin.inicio'))
            ->assertInertia(fn ($page) => $page->where('novedadesSinLeer', 0));
    }

    public function test_reading_is_per_person(): void
    {
        $uno = User::factory()->viewer()->create();
        $otro = User::factory()->viewer()->create();

        $this->actingAs($uno)->get(route('admin.novedades'));

        $this->actingAs($otro)->get(route('admin.novedades'))
            ->assertInertia(fn ($page) => $page->where('novedades.0.nueva', true));
    }

    public function test_only_who_manages_novedades_can_publish_edit_and_delete(): void
    {
        $viewer = User::factory()->viewer()->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($viewer)->post(route('admin.novedades.store'), ['fecha' => '2026-10-22', 'titulo' => 'X', 'texto' => 'Y'])
            ->assertForbidden();

        $this->actingAs($admin)->post(route('admin.novedades.store'), ['fecha' => '2026-10-22', 'titulo' => '<i>Hola</i>', 'texto' => 'Texto <script>x</script>'])
            ->assertSessionHasNoErrors();

        $novedad = Novedad::query()->where('titulo', 'Hola')->firstOrFail();
        $this->assertSame('Texto x', $novedad->texto);
        $this->assertSame($admin->id, $novedad->creado_por);

        $this->actingAs($viewer)->put(route('admin.novedades.update', $novedad), ['fecha' => '2026-10-23', 'titulo' => 'Z', 'texto' => 'Z'])
            ->assertForbidden();

        $this->actingAs($admin)->put(route('admin.novedades.update', $novedad), ['fecha' => '2026-10-23', 'titulo' => 'Nuevo titulo', 'texto' => 'Nuevo texto'])
            ->assertSessionHasNoErrors();
        $this->assertSame('Nuevo titulo', $novedad->fresh()->titulo);

        $this->actingAs($viewer)->delete(route('admin.novedades.destroy', $novedad))->assertForbidden();
        $this->actingAs($admin)->delete(route('admin.novedades.destroy', $novedad));
        $this->assertNull(Novedad::find($novedad->id));
    }

    public function test_deleting_a_novedad_removes_its_read_marks(): void
    {
        $admin = User::factory()->admin()->create();
        $novedad = Novedad::query()->firstOrFail();

        $this->actingAs($admin)->get(route('admin.novedades'));
        $this->assertSame(1, DB::table('novedad_lecturas')->where('novedad_id', $novedad->id)->count());

        $this->actingAs($admin)->delete(route('admin.novedades.destroy', $novedad));
        $this->assertSame(0, DB::table('novedad_lecturas')->where('novedad_id', $novedad->id)->count());
    }

    // -------------------------------------------------------------- descargas

    public function test_only_who_manages_descargas_can_upload_and_everyone_can_download(): void
    {
        Storage::fake('local');
        $viewer = User::factory()->viewer()->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($viewer)
            ->post(route('admin.descargas.store'), ['archivo' => UploadedFile::fake()->create('guia.pdf', 100, 'application/pdf')])
            ->assertForbidden();

        $this->actingAs($admin)
            ->post(route('admin.descargas.store'), ['archivo' => UploadedFile::fake()->create('guia.pdf', 100, 'application/pdf'), 'nombre' => 'Guía de ejemplo'])
            ->assertSessionHasNoErrors();

        $descarga = Descarga::query()->firstOrFail();
        $this->assertSame('Guía de ejemplo', $descarga->nombre);
        $this->assertSame('pdf', $descarga->extension);
        Storage::disk('local')->assertExists($descarga->archivo);

        $this->actingAs($viewer)->get(route('admin.descargas.download', $descarga))
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_the_download_needs_a_session(): void
    {
        $descarga = Descarga::create([
            'nombre' => 'Guia',
            'archivo' => 'descargas/guia.pdf',
            'nombre_original' => 'guia.pdf',
            'extension' => 'pdf',
            'tamano' => 10,
        ]);

        $this->get(route('admin.descargas.download', $descarga))->assertRedirect(route('login'));
    }

    public function test_only_allowed_types_and_sizes_are_accepted(): void
    {
        Storage::fake('local');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.descargas.store'), ['archivo' => UploadedFile::fake()->create('virus.exe', 10, 'application/x-msdownload')])
            ->assertSessionHasErrors('archivo');

        $this->actingAs($admin)
            ->post(route('admin.descargas.store'), ['archivo' => UploadedFile::fake()->create('enorme.pdf', 25000, 'application/pdf')])
            ->assertSessionHasErrors('archivo');

        $this->assertSame(0, Descarga::count());
    }

    public function test_a_descarga_can_be_renamed_and_deleted_with_its_file(): void
    {
        Storage::fake('local');
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->post(route('admin.descargas.store'), ['archivo' => UploadedFile::fake()->create('plan.pdf', 10, 'application/pdf')]);
        $descarga = Descarga::query()->firstOrFail();
        $ruta = $descarga->archivo;

        $this->actingAs($admin)->put(route('admin.descargas.update', $descarga), ['nombre' => '<b>Plan 2026</b>'])
            ->assertSessionHasNoErrors();
        $this->assertSame('Plan 2026', $descarga->fresh()->nombre);

        $this->actingAs($admin)->delete(route('admin.descargas.destroy', $descarga));
        $this->assertNull(Descarga::find($descarga->id));
        Storage::disk('local')->assertMissing($ruta);
    }

    // ------------------------------------------------------------------ inicio

    public function test_inicio_brings_pages_novedades_and_descargas(): void
    {
        $user = User::factory()->viewer()->create();

        $this->actingAs($user)->get(route('admin.inicio'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/inicio')
                ->has('paginas')
                ->has('novedades')
                ->has('descargas'));
    }
}
