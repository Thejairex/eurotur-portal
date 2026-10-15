<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingTourTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_who_has_not_done_the_tours_sees_them_as_pending(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('home'))
            ->assertInertia(fn ($page) => $page
                ->where('tours.portal', true)
                ->where('tours.backoffice', true));
    }

    public function test_guests_have_no_pending_tours(): void
    {
        $this->get(route('home'))
            ->assertInertia(fn ($page) => $page
                ->where('tours.portal', false)
                ->where('tours.backoffice', false));
    }

    public function test_completing_one_tour_does_not_complete_the_other(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('onboarding.complete', ['tour' => 'portal']))
            ->assertRedirect();

        $user = $user->fresh();
        $this->assertNotNull($user->portal_tour_completed_at);
        $this->assertNull($user->backoffice_tour_completed_at);

        $this->actingAs($user)
            ->get(route('home'))
            ->assertInertia(fn ($page) => $page
                ->where('tours.portal', false)
                ->where('tours.backoffice', true));
    }

    public function test_completing_the_backoffice_tour_stores_its_date(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('onboarding.complete', ['tour' => 'backoffice']))
            ->assertRedirect();

        $this->assertNotNull($user->fresh()->backoffice_tour_completed_at);
        $this->assertNull($user->fresh()->portal_tour_completed_at);
    }

    public function test_completing_it_twice_keeps_the_original_date(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('onboarding.complete', ['tour' => 'portal']));
        $first = $user->fresh()->portal_tour_completed_at;

        $this->travel(2)->days();

        $this->actingAs($user->fresh())->post(route('onboarding.complete', ['tour' => 'portal']));

        $this->assertTrue($first->equalTo($user->fresh()->portal_tour_completed_at));
    }

    public function test_each_user_has_their_own_tours(): void
    {
        $done = User::factory()->create([
            'portal_tour_completed_at' => now(),
            'backoffice_tour_completed_at' => now(),
        ]);
        $new = User::factory()->create();

        $this->actingAs($done)
            ->get(route('home'))
            ->assertInertia(fn ($page) => $page
                ->where('tours.portal', false)
                ->where('tours.backoffice', false));

        $this->actingAs($new)
            ->get(route('home'))
            ->assertInertia(fn ($page) => $page
                ->where('tours.portal', true)
                ->where('tours.backoffice', true));
    }

    public function test_an_unknown_tour_name_is_not_found(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/recorrido/otro/completar')
            ->assertNotFound();
    }

    public function test_guests_cannot_complete_a_tour(): void
    {
        $this->post(route('onboarding.complete', ['tour' => 'portal']))
            ->assertRedirect(route('login'));
    }
}
