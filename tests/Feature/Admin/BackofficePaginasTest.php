<?php

namespace Tests\Feature\Admin;

use App\Models\SectorGroup;
use App\Models\SectorItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Back Office: "Editar páginas".
 */
class BackofficePaginasTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_sent_to_login(): void
    {
        $this->get(route('admin.paginas'))->assertRedirect(route('login'));
    }

    public function test_it_lists_block_and_link_counts_per_page(): void
    {
        $group = SectorGroup::create(['sector' => 'rrhh', 'title' => 'Uno', 'sort_order' => 0]);
        SectorGroup::create(['sector' => 'rrhh', 'title' => 'Dos', 'sort_order' => 1]);
        SectorItem::create(['sector_group_id' => $group->id, 'label' => 'Link', 'url' => 'https://example.com', 'sort_order' => 0]);

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('admin.paginas'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/paginas')
                ->where('paginas.rrhh.bloques', 2)
                ->where('paginas.rrhh.links', 1));
    }
}
