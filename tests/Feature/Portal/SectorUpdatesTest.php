<?php

namespace Tests\Feature\Portal;

use App\Models\Frente;
use App\Models\SectorGroup;
use App\Models\SectorItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SectorUpdatesTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_sector_with_no_edits_has_no_real_date(): void
    {
        $this->get(route('portal.rrhh'))
            ->assertInertia(fn ($page) => $page->where('sectorUpdates', []));
    }

    public function test_creating_a_group_records_who_and_when(): void
    {
        $this->travelTo('2026-10-15 16:30:00');
        $user = User::factory()->admin()->create(['name' => 'Ana Prueba']);

        $this->actingAs($user)->post(route('portal.groups.store', ['sector' => 'rrhh']), ['title' => 'Nuevo grupo']);

        $this->assertDatabaseHas('sector_updates', [
            'sector' => 'rrhh',
            'edited_by_name' => 'Ana Prueba',
            'edited_at' => '2026-10-15 16:30:00',
        ]);
    }

    public function test_the_page_shows_the_real_date_and_author(): void
    {
        $user = User::factory()->admin()->create(['name' => 'Ana Prueba']);

        $this->actingAs($user)->post(route('portal.groups.store', ['sector' => 'rrhh']), ['title' => 'Nuevo grupo']);

        $this->actingAs($user)->get(route('portal.rrhh'))
            ->assertInertia(fn ($page) => $page
                ->where('sectorUpdates.rrhh.por', 'Ana Prueba')
                ->has('sectorUpdates.rrhh.en'));
    }

    public function test_editing_again_moves_the_date_forward_keeping_one_row_per_sector(): void
    {
        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'it', 'title' => 'Grupo', 'sort_order' => 0]);

        $this->travelTo('2026-10-15 10:00:00');
        $this->actingAs($user)->post(route('portal.items.store', $group), ['label' => 'Uno', 'url' => 'https://example.com']);

        $this->travelTo('2026-10-16 09:15:00');
        $this->actingAs($user)->post(route('portal.items.store', $group), ['label' => 'Dos', 'url' => 'https://example.com']);

        $this->assertDatabaseCount('sector_updates', 1);
        $this->assertDatabaseHas('sector_updates', ['sector' => 'it', 'edited_at' => '2026-10-16 09:15:00']);

        // La página ya no sirve la fecha vieja guardada en la caché.
        $this->get(route('portal.it'))
            ->assertInertia(fn ($page) => $page->where('sectorUpdates.it.en', fn ($valor) => str_starts_with($valor, '2026-10-16T09:15:00')));
    }

    public function test_updating_and_deleting_an_item_also_count_as_edits(): void
    {
        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'sales', 'title' => 'Grupo', 'sort_order' => 0]);
        $item = SectorItem::create(['sector_group_id' => $group->id, 'label' => 'Link', 'url' => 'https://example.com', 'sort_order' => 0]);

        $this->travelTo('2026-10-15 11:00:00');
        $this->actingAs($user)->put(route('portal.items.update', $item), ['label' => 'Link nuevo']);
        $this->assertDatabaseHas('sector_updates', ['sector' => 'sales', 'edited_at' => '2026-10-15 11:00:00']);

        $this->travelTo('2026-10-15 12:00:00');
        $this->actingAs($user)->delete(route('portal.items.destroy', $item));
        $this->assertDatabaseHas('sector_updates', ['sector' => 'sales', 'edited_at' => '2026-10-15 12:00:00']);
    }

    public function test_deleting_a_group_counts_as_an_edit(): void
    {
        $user = User::factory()->admin()->create();
        $group = SectorGroup::create(['sector' => 'operaciones', 'title' => 'Grupo', 'sort_order' => 0]);

        $this->actingAs($user)->delete(route('portal.groups.destroy', $group));

        $this->assertDatabaseHas('sector_updates', ['sector' => 'operaciones']);
    }

    public function test_innovacion_edits_are_recorded_under_innovacion(): void
    {
        $user = User::factory()->admin()->create(['name' => 'Ana Prueba']);

        $this->actingAs($user)->post(route('portal.frentes.store'), ['area' => 'Nuevo frente', 'owner' => 'J. Pérez']);

        $this->assertDatabaseHas('sector_updates', ['sector' => 'innovacion', 'edited_by_name' => 'Ana Prueba']);

        $frente = Frente::query()->firstOrFail();
        $this->actingAs($user)->delete(route('portal.frentes.destroy', $frente));

        $this->assertDatabaseCount('sector_updates', 1);
    }

    public function test_a_failed_edit_does_not_touch_the_date(): void
    {
        $user = User::factory()->admin()->create();

        $this->actingAs($user)->post(route('portal.groups.store', ['sector' => 'rrhh']), ['title' => '']);

        $this->assertDatabaseCount('sector_updates', 0);
    }
}
