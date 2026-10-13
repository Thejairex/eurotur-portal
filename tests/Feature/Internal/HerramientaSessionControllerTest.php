<?php

namespace Tests\Feature\Internal;

use App\Enums\Permission;
use App\Models\Permission as PermissionModel;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HerramientaSessionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_an_unknown_tool_is_not_found(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('internal.herramientas.validar-sesion', ['herramienta' => 'no-existe']))
            ->assertNotFound();
    }

    public function test_guests_are_unauthorized(): void
    {
        $this->get(route('internal.herramientas.validar-sesion', ['herramienta' => 'balanz']))
            ->assertStatus(401)
            ->assertHeaderMissing('X-Portal-Usuario');
    }

    public function test_users_without_the_permission_are_unauthorized(): void
    {
        $user = User::factory()->viewer()->create();

        $this->actingAs($user)
            ->get(route('internal.herramientas.validar-sesion', ['herramienta' => 'balanz']))
            ->assertStatus(401);
    }

    public function test_a_user_with_the_permission_gets_the_identity_headers_ascii_folded(): void
    {
        $role = Role::create(['slug' => 'contabilidad', 'name' => 'Contabilidad Más']);
        $role->permissions()->sync(PermissionModel::where('slug', Permission::BalanzManage->value)->pluck('id'));
        $role->flushPermissionCache();

        $user = User::factory()->withRole($role)->create(['name' => 'Elsa Quintana Peñaloza']);

        $this->actingAs($user)
            ->get(route('internal.herramientas.validar-sesion', ['herramienta' => 'balanz']))
            ->assertOk()
            ->assertHeader('X-Portal-Usuario', 'Elsa Quintana Penaloza')
            ->assertHeader('X-Portal-Rol', 'Contabilidad Mas');
    }

    public function test_the_prepagos_permission_does_not_unlock_balanz(): void
    {
        $role = Role::create(['slug' => 'prepagos', 'name' => 'Prepagos']);
        $role->permissions()->sync(PermissionModel::where('slug', Permission::PrepagosManage->value)->pluck('id'));
        $role->flushPermissionCache();

        $user = User::factory()->withRole($role)->create();

        $this->actingAs($user)
            ->get(route('internal.herramientas.validar-sesion', ['herramienta' => 'balanz']))
            ->assertStatus(401);
    }
}
