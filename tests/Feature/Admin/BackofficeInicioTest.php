<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackofficeInicioTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_sent_to_the_login(): void
    {
        $this->get(route('admin.inicio'))->assertRedirect(route('login'));
    }

    public function test_a_logged_in_user_sees_the_inicio(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.inicio'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/inicio'));
    }

    public function test_the_backoffice_root_leads_to_the_inicio(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/administracion')
            ->assertRedirect('/administracion/inicio');
    }
}
