<?php

namespace Tests\Feature\Portal;

use App\Models\SectorGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SectorGroupControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_a_group(): void
    {
        $response = $this->post(route('portal.groups.store', ['sector' => 'rrhh']), [
            'title' => 'Nuevo grupo',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('sector_groups', 0);
    }

    public function test_authenticated_user_can_create_a_group(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('portal.groups.store', ['sector' => 'rrhh']), [
                'title' => 'Nuevo grupo',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();

        $this->assertDatabaseHas('sector_groups', [
            'sector' => 'rrhh',
            'title' => 'Nuevo grupo',
        ]);
    }

    public function test_group_creation_requires_a_valid_sector(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('portal.groups.store', ['sector' => 'not-a-sector']), [
                'title' => 'Nuevo grupo',
            ]);

        $response->assertNotFound();
    }

    public function test_authenticated_user_can_update_a_group(): void
    {
        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Original', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->put(route('portal.groups.update', $group), ['title' => 'Actualizado']);

        $response->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame('Actualizado', $group->refresh()->title);
    }

    public function test_authenticated_user_can_delete_a_group(): void
    {
        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Original', 'sort_order' => 0]);

        $response = $this
            ->actingAs($user)
            ->delete(route('portal.groups.destroy', $group));

        $response->assertRedirect();
        $this->assertModelMissing($group);
    }

    public function test_a_group_can_be_moved_up_and_down_within_its_sector(): void
    {
        $user = User::factory()->admin()->create();
        $first = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Uno', 'sort_order' => 0]);
        $second = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Dos', 'sort_order' => 1]);
        $other = SectorGroup::create(['sector' => 'adm', 'title' => 'Otro sector', 'sort_order' => 0]);

        $this->actingAs($user)
            ->post(route('portal.groups.move', $second), ['direction' => 'up'])
            ->assertRedirect();

        $this->assertSame(1, $first->refresh()->sort_order);
        $this->assertSame(0, $second->refresh()->sort_order);
        $this->assertSame(0, $other->refresh()->sort_order);

        $this->actingAs($user)
            ->post(route('portal.groups.move', $second), ['direction' => 'down'])
            ->assertRedirect();

        $this->assertSame(0, $first->refresh()->sort_order);
        $this->assertSame(1, $second->refresh()->sort_order);
    }

    public function test_a_group_can_be_dragged_to_any_position(): void
    {
        $user = User::factory()->admin()->create();
        $a = SectorGroup::create(['sector' => 'rrhh', 'title' => 'A', 'sort_order' => 0]);
        $b = SectorGroup::create(['sector' => 'rrhh', 'title' => 'B', 'sort_order' => 1]);
        $c = SectorGroup::create(['sector' => 'rrhh', 'title' => 'C', 'sort_order' => 2]);
        $other = SectorGroup::create(['sector' => 'adm', 'title' => 'Otro', 'sort_order' => 0]);

        $this->actingAs($user)
            ->post(route('portal.groups.move', $a), ['position' => 2])
            ->assertRedirect();

        $this->assertSame(0, $b->refresh()->sort_order);
        $this->assertSame(1, $c->refresh()->sort_order);
        $this->assertSame(2, $a->refresh()->sort_order);
        $this->assertSame(0, $other->refresh()->sort_order);

        // Una posición pasada del final queda en el último lugar.
        $this->actingAs($user)
            ->post(route('portal.groups.move', $b), ['position' => 99])
            ->assertRedirect();

        $this->assertSame(2, $b->refresh()->sort_order);
        $this->assertSame(0, $c->refresh()->sort_order);
        $this->assertSame(1, $a->refresh()->sort_order);
    }

    public function test_move_needs_a_direction_or_a_position(): void
    {
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Uno', 'sort_order' => 0]);

        $this->actingAs(User::factory()->admin()->create())
            ->post(route('portal.groups.move', $group), [])
            ->assertSessionHasErrors(['direction', 'position']);
    }

    public function test_moving_a_group_works_even_when_sort_orders_are_duplicated(): void
    {
        $user = User::factory()->admin()->create();
        $first = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Uno', 'sort_order' => 3]);
        $second = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Dos', 'sort_order' => 3]);

        $this->actingAs($user)
            ->post(route('portal.groups.move', $second), ['direction' => 'up'])
            ->assertRedirect();

        $this->assertSame(1, $first->refresh()->sort_order);
        $this->assertSame(0, $second->refresh()->sort_order);
    }

    public function test_moving_the_first_group_up_changes_nothing(): void
    {
        $user = User::factory()->admin()->create();
        $first = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Uno', 'sort_order' => 0]);
        $second = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Dos', 'sort_order' => 1]);

        $this->actingAs($user)
            ->post(route('portal.groups.move', $first), ['direction' => 'up'])
            ->assertRedirect();

        $this->assertSame(0, $first->refresh()->sort_order);
        $this->assertSame(1, $second->refresh()->sort_order);
    }

    public function test_move_requires_a_valid_direction_and_a_logged_in_editor(): void
    {
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Uno', 'sort_order' => 0]);

        $this->post(route('portal.groups.move', $group), ['direction' => 'up'])
            ->assertRedirect(route('login'));

        $this->actingAs(User::factory()->admin()->create())
            ->post(route('portal.groups.move', $group), ['direction' => 'sideways'])
            ->assertSessionHasErrors('direction');
    }
}
