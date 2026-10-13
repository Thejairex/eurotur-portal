<?php

namespace Tests\Feature\Admin;

use App\Enums\Permission;
use App\Models\Permission as PermissionModel;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PrebalanceAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // The portal layout fetches rates and bot status on every visit.
        Http::fake([
            'dolarapi.com/*' => Http::response(['venta' => 1510, 'compra' => 1460]),
            'euroturbot-monitor:8000/*' => Http::response(['state' => 'idle', 'stats' => null]),
            'sudameria.com/*' => Http::response(null, 403),
        ]);

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_guests_are_sent_to_login(): void
    {
        $this->get(route('portal.adm.prebalance'))->assertRedirect(route('login'));
    }

    public function test_users_without_the_permission_are_forbidden(): void
    {
        $viewer = User::factory()->viewer()->create();

        $this->actingAs($viewer)->get(route('portal.adm.prebalance'))->assertForbidden();
    }

    public function test_editors_do_not_get_it_for_free(): void
    {
        // prebalance.use is not part of contentPermissions().
        $editor = User::factory()->editor()->create();

        $this->actingAs($editor)->get(route('portal.adm.prebalance'))->assertForbidden();
    }

    public function test_a_role_with_the_permission_can_open_it(): void
    {
        $user = User::factory()->withRole($this->contabilidadRole())->create();

        $this->actingAs($user)->get(route('portal.adm.prebalance'))->assertOk();
    }

    public function test_the_permission_unlocks_the_herramientas_hub(): void
    {
        $user = User::factory()->withRole($this->contabilidadRole())->create();

        $this->actingAs($user)->get(route('admin.crm.index'))->assertOk();
    }

    private function contabilidadRole(): Role
    {
        $role = Role::create(['slug' => 'contabilidad', 'name' => 'Contabilidad']);
        $role->permissions()->sync(PermissionModel::where('slug', Permission::PrebalanceUse->value)->pluck('id'));
        $role->flushPermissionCache();

        return $role;
    }
}
