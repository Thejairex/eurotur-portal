<?php

namespace Tests\Feature\Admin;

use App\Enums\Permission;
use App\Models\Permission as PermissionModel;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganigramaAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_users_without_the_permission_are_forbidden(): void
    {
        $viewer = User::factory()->viewer()->create();

        $this->actingAs($viewer)->get(route('admin.organigrama'))->assertForbidden();
    }

    public function test_editors_do_not_get_it_for_free(): void
    {
        // organigrama.editar is not part of contentPermissions(): editing the sector pages
        // does not let anyone edit the people in the organigrama.
        $editor = User::factory()->editor()->create();

        $this->actingAs($editor)->get(route('admin.organigrama'))->assertForbidden();
    }

    public function test_admins_are_redirected_to_the_edit_screen_of_the_app(): void
    {
        config(['services.organigrama.url' => 'http://192.168.98.4:8240/']);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.organigrama'))
            ->assertRedirect('http://192.168.98.4:8240/editar');
    }

    public function test_an_rrhh_role_with_only_this_permission_can_edit_and_sees_the_hub(): void
    {
        $role = Role::create(['slug' => 'rrhh', 'name' => 'RRHH']);
        $role->permissions()->sync(PermissionModel::where('slug', Permission::OrganigramaEditar->value)->pluck('id'));
        $role->flushPermissionCache();

        $user = User::factory()->withRole($role)->create(['name' => 'Romina Velázquez']);

        $this->actingAs($user)->get(route('admin.organigrama'))->assertRedirect();
        $this->actingAs($user)->get(route('admin.crm.index'))->assertOk();

        // The generic session check lets the proxy of the app know who is editing.
        $this->actingAs($user)
            ->get(route('internal.herramientas.validar-sesion', ['herramienta' => 'organigrama']))
            ->assertOk()
            ->assertHeader('X-Portal-Usuario', 'Romina Velazquez');
    }

    public function test_the_big_brother_permission_does_not_open_the_organigrama_session_check(): void
    {
        $role = Role::create(['slug' => 'administracion', 'name' => 'Administración']);
        $role->permissions()->sync(PermissionModel::where('slug', Permission::BigBrotherVer->value)->pluck('id'));
        $role->flushPermissionCache();

        $user = User::factory()->withRole($role)->create();

        $this->actingAs($user)
            ->get(route('internal.herramientas.validar-sesion', ['herramienta' => 'organigrama']))
            ->assertStatus(401);
    }

    public function test_the_public_view_route_redirects_to_the_app_and_passes_the_query_string(): void
    {
        config(['services.organigrama.url' => 'http://192.168.98.4:8240']);

        $this->get(route('portal.organigrama'))->assertRedirect('http://192.168.98.4:8240/');
        $this->get('/organigrama?empresa=TD')->assertRedirect('http://192.168.98.4:8240/?empresa=TD');
    }

    public function test_the_public_view_route_never_redirects_to_a_destination_taken_from_the_request(): void
    {
        config(['services.organigrama.url' => 'http://192.168.98.4:8240']);

        $respuesta = $this->get('/organigrama?url=https://evil.example.com');

        $respuesta->assertRedirect();
        $this->assertStringStartsWith('http://192.168.98.4:8240/', (string) $respuesta->headers->get('Location'));
    }
}
