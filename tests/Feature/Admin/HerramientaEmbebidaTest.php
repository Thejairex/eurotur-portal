<?php

namespace Tests\Feature\Admin;

use App\Enums\Permission;
use App\Models\Permission as PermissionModel;
use App\Models\Role;
use App\Models\User;
use App\Support\HerramientasExternas;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HerramientaEmbebidaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
        config(['services.big_brother.url' => 'http://192.168.98.4:8230/']);
    }

    public function test_guests_are_sent_to_login(): void
    {
        $this->get(route('admin.herramientas.embebida', ['herramienta' => 'big-brother']))
            ->assertRedirect(route('login'));
    }

    public function test_an_unknown_tool_is_not_found(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.herramientas.embebida', ['herramienta' => 'no-existe']))
            ->assertNotFound();
    }

    public function test_users_without_the_permission_are_forbidden(): void
    {
        $viewer = User::factory()->viewer()->create();

        $this->actingAs($viewer)
            ->get(route('admin.herramientas.embebida', ['herramienta' => 'big-brother']))
            ->assertForbidden();
    }

    public function test_editors_do_not_get_it_for_free(): void
    {
        $editor = User::factory()->editor()->create();

        $this->actingAs($editor)
            ->get(route('admin.herramientas.embebida', ['herramienta' => 'big-brother']))
            ->assertForbidden();
    }

    public function test_the_permission_of_another_tool_does_not_open_it(): void
    {
        $role = Role::create(['slug' => 'contabilidad', 'name' => 'Contabilidad']);
        $role->permissions()->sync(PermissionModel::where('slug', Permission::BalanzManage->value)->pluck('id'));
        $role->flushPermissionCache();

        $user = User::factory()->withRole($role)->create();

        $this->actingAs($user)
            ->get(route('admin.herramientas.embebida', ['herramienta' => 'big-brother']))
            ->assertForbidden();
    }

    public function test_a_role_with_the_permission_gets_the_embedded_page_with_both_urls(): void
    {
        $role = Role::create(['slug' => 'rrhh', 'name' => 'RRHH']);
        $role->permissions()->sync(PermissionModel::where('slug', Permission::BigBrotherVer->value)->pluck('id'));
        $role->flushPermissionCache();

        $user = User::factory()->withRole($role)->create();

        $this->actingAs($user)
            ->get(route('admin.herramientas.embebida', ['herramienta' => 'big-brother']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/herramientas/embebida')
                ->where('label', 'Big Brother — Vencimientos')
                ->where('area', 'RRHH')
                ->where('src', 'http://192.168.98.4:8230/?embebido=1')
                ->where('abrirEn', 'http://192.168.98.4:8230/'));
    }

    public function test_the_urls_come_from_config_and_never_from_the_request(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.herramientas.embebida', ['herramienta' => 'big-brother']).'?src=https://evil.example.com')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('src', 'http://192.168.98.4:8230/?embebido=1'));
    }

    public function test_every_tool_builds_its_url_with_its_entry_path(): void
    {
        config([
            'services.balanz.url' => 'http://h:1',
            'services.prepagos.url' => 'http://h:2/',
            'services.organigrama.url' => 'http://h:3',
        ]);

        $this->assertSame('http://h:1/', HerramientasExternas::url('balanz'));
        $this->assertSame('http://h:2/?embebido=1', HerramientasExternas::url('prepagos', embebido: true));
        $this->assertSame('http://h:3/editar?embebido=1', HerramientasExternas::url('organigrama', embebido: true));
    }

    public function test_every_registered_tool_declares_a_known_permission_and_a_config_url(): void
    {
        foreach (HerramientasExternas::todas() as $slug => $datos) {
            $this->assertContains($datos['permission']->value, Permission::values(), $slug);
            $this->assertNotNull(config($datos['config']), "{$slug}: falta la URL en config");
        }
    }
}
