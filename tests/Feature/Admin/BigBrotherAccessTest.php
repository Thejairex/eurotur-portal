<?php

namespace Tests\Feature\Admin;

use App\Enums\Permission;
use App\Models\Permission as PermissionModel;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BigBrotherAccessTest extends TestCase
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

        $this->actingAs($viewer)->get(route('admin.big-brother'))->assertForbidden();
    }

    public function test_editors_do_not_get_it_for_free(): void
    {
        $editor = User::factory()->editor()->create();

        $this->actingAs($editor)->get(route('admin.big-brother'))->assertForbidden();
    }

    public function test_admins_are_redirected_to_the_external_url(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.big-brother'))
            ->assertRedirect(config('services.big_brother.url'));
    }

    public function test_a_role_with_only_the_permission_can_use_it_and_sees_the_hub(): void
    {
        $role = Role::create(['slug' => 'administracion', 'name' => 'Administración']);
        $role->permissions()->sync(PermissionModel::where('slug', Permission::BigBrotherVer->value)->pluck('id'));
        $role->flushPermissionCache();

        $user = User::factory()->withRole($role)->create();

        $this->actingAs($user)->get(route('admin.big-brother'))->assertRedirect(config('services.big_brother.url'));
        $this->actingAs($user)->get(route('admin.crm.index'))->assertOk();
    }

    public function test_the_generic_session_check_answers_for_big_brother(): void
    {
        $role = Role::create(['slug' => 'administracion', 'name' => 'Administración']);
        $role->permissions()->sync(PermissionModel::where('slug', Permission::BigBrotherVer->value)->pluck('id'));
        $role->flushPermissionCache();

        $user = User::factory()->withRole($role)->create(['name' => 'Aldo Pérez']);

        $this->actingAs($user)
            ->get(route('internal.herramientas.validar-sesion', ['herramienta' => 'big-brother']))
            ->assertOk()
            ->assertHeader('X-Portal-Usuario', 'Aldo Perez');

        // The Big Brother permission must not open Balanz's door.
        $this->get(route('internal.herramientas.validar-sesion', ['herramienta' => 'balanz']))
            ->assertStatus(401);
    }
}
