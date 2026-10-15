<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingTourTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_who_has_not_done_the_tour_sees_it_as_pending(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('home'))
            ->assertInertia(fn ($page) => $page->where('onboardingPending', true));
    }

    public function test_completing_the_tour_stores_the_date_and_stops_showing_it(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('admin.onboarding.complete'))
            ->assertRedirect();

        $this->assertNotNull($user->fresh()->onboarding_completed_at);

        $this->actingAs($user->fresh())
            ->get(route('home'))
            ->assertInertia(fn ($page) => $page->where('onboardingPending', false));
    }

    public function test_completing_it_twice_keeps_the_original_date(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('admin.onboarding.complete'));
        $first = $user->fresh()->onboarding_completed_at;

        $this->travel(2)->days();

        $this->actingAs($user->fresh())->post(route('admin.onboarding.complete'));

        $this->assertTrue($first->equalTo($user->fresh()->onboarding_completed_at));
    }

    public function test_each_user_has_their_own_tour(): void
    {
        $done = User::factory()->create(['onboarding_completed_at' => now()]);
        $new = User::factory()->create();

        $this->actingAs($done)
            ->get(route('home'))
            ->assertInertia(fn ($page) => $page->where('onboardingPending', false));

        $this->actingAs($new)
            ->get(route('home'))
            ->assertInertia(fn ($page) => $page->where('onboardingPending', true));
    }

    public function test_guests_cannot_complete_it(): void
    {
        $this->post(route('admin.onboarding.complete'))->assertRedirect(route('login'));
    }
}
