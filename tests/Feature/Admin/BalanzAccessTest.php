<?php

namespace Tests\Feature\Admin;

use App\Enums\Permission;
use App\Models\Permission as PermissionModel;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BalanzAccessTest extends TestCase
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

        $this->actingAs($viewer)->get(route('admin.balanz'))->assertForbidden();
    }

    public function test_editors_do_not_get_it_for_free(): void
    {
        $editor = User::factory()->editor()->create();

        $this->actingAs($editor)->get(route('admin.balanz'))->assertForbidden();
    }

    public function test_admins_are_redirected_to_the_external_url(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.balanz'))
            ->assertRedirect(config('services.balanz.url'));
    }

    public function test_a_role_with_only_the_balanz_permission_can_use_it_and_sees_the_hub(): void
    {
        $role = Role::create(['slug' => 'contabilidad', 'name' => 'Contabilidad']);
        $role->permissions()->sync(PermissionModel::where('slug', Permission::BalanzManage->value)->pluck('id'));
        $role->flushPermissionCache();

        $user = User::factory()->withRole($role)->create();

        $this->actingAs($user)->get(route('admin.balanz'))->assertRedirect(config('services.balanz.url'));
        $this->actingAs($user)->get(route('admin.crm.index'))->assertOk();
    }
}
