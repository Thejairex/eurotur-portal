<?php

namespace Tests\Feature\Admin;

use App\Enums\Permission;
use App\Mail\WelcomeMail;
use App\Models\Role;
use App\Models\SectorGroup;
use App\Models\User;
use App\Services\PageOwners;
use App\Services\TemporaryPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Responsables de página: permisos por persona, correo de bienvenida y cambio obligatorio de contraseña.
 */
class ResponsablesYBienvenidaTest extends TestCase
{
    use RefreshDatabase;

    private function viewerRoleId(): int
    {
        return User::factory()->viewer()->create()->role_id;
    }

    // ------------------------------------------------------------- permisos por página

    public function test_a_page_permission_given_to_one_person_lets_them_edit_only_that_page(): void
    {
        $user = User::factory()->viewer()->create();
        PageOwners::sync($user, [Permission::SectorContratacionesEdit->value]);
        $mine = SectorGroup::create(['sector' => 'contrataciones', 'title' => 'Mío', 'sort_order' => 0]);
        $other = SectorGroup::create(['sector' => 'operaciones', 'title' => 'Ajeno', 'sort_order' => 0]);

        $this->actingAs($user)
            ->put(route('portal.groups.update', $mine), ['title' => 'Nuevo nombre'])
            ->assertRedirect();
        $this->assertSame('Nuevo nombre', $mine->refresh()->title);

        $this->actingAs($user)
            ->put(route('portal.groups.update', $other), ['title' => 'Intento'])
            ->assertForbidden();
        $this->actingAs($user)
            ->post(route('portal.groups.move', $other), ['direction' => 'down'])
            ->assertForbidden();
        $this->actingAs($user)
            ->delete(route('portal.groups.destroy', $other))
            ->assertForbidden();
        $this->assertSame('Ajeno', $other->refresh()->title);
    }

    public function test_the_extra_permission_reaches_the_frontend_and_sync_replaces_the_pages(): void
    {
        $user = User::factory()->viewer()->create();

        PageOwners::sync($user, [Permission::SectorItEdit->value, Permission::SectorSalesEdit->value]);
        $this->assertEqualsCanonicalizing(
            [Permission::SectorItEdit->value, Permission::SectorSalesEdit->value],
            $user->fresh()->extraPermissionSlugs(),
        );
        $this->assertTrue($user->fresh()->hasPermission(Permission::SectorItEdit));

        PageOwners::sync($user, [Permission::SectorSalesEdit->value]);
        $this->assertFalse($user->fresh()->hasPermission(Permission::SectorItEdit));
        $this->assertTrue($user->fresh()->hasPermission(Permission::SectorSalesEdit));

        // Lo que no es una página (por ejemplo gestionar usuarios) no se puede dar por esta vía.
        PageOwners::sync($user, [Permission::UsersManage->value]);
        $this->assertFalse($user->fresh()->hasPermission(Permission::UsersManage));
    }

    public function test_the_email_map_gives_only_that_persons_pages(): void
    {
        $this->assertSame([Permission::SectorOperacionesEdit->value], PageOwners::mappedFor('Valeria.Juliano@eurotur.tur.ar '));
        $this->assertSame([], PageOwners::mappedFor('nadie@eurotur.tur.ar'));

        $user = User::factory()->viewer()->create(['email' => 'mariana.garrigo@eurotur.tur.ar']);
        $this->artisan('usuarios:asignar-paginas')->assertSuccessful();
        $this->assertSame([], $user->fresh()->extraPermissionSlugs());

        $this->artisan('usuarios:asignar-paginas', ['--aplicar' => true])->assertSuccessful();
        $this->assertSame([Permission::SectorContratacionesEdit->value], $user->fresh()->extraPermissionSlugs());
    }

    // ------------------------------------------------------------- alta con bienvenida

    public function test_creating_a_user_sends_the_welcome_mail_with_a_temporary_password_and_marks_it_temporary(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Valeria Juliano',
                'email' => 'valeria.juliano@eurotur.tur.ar',
                'role_id' => $this->viewerRoleId(),
                'paginas' => [Permission::SectorItEdit->value],
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.users.index'));

        $user = User::where('email', 'valeria.juliano@eurotur.tur.ar')->firstOrFail();
        $this->assertTrue($user->must_change_password);
        $this->assertNotNull($user->welcome_sent_at);
        // Las tildadas más las del mapa por correo.
        $this->assertEqualsCanonicalizing(
            [Permission::SectorItEdit->value, Permission::SectorOperacionesEdit->value],
            $user->extraPermissionSlugs(),
        );

        Mail::assertSent(WelcomeMail::class, function (WelcomeMail $mail) use ($user): bool {
            return $mail->hasTo('valeria.juliano@eurotur.tur.ar')
                && Hash::check($mail->temporaryPassword, $user->password)
                && strlen($mail->temporaryPassword) >= 12
                && str_contains($mail->render(), $mail->temporaryPassword)
                && str_contains($mail->render(), 'valeria.juliano@eurotur.tur.ar');
        });
    }

    public function test_the_welcome_mail_can_be_skipped_and_a_defined_password_is_still_temporary(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Persona',
                'email' => 'persona@eurotur.tur.ar',
                'role_id' => $this->viewerRoleId(),
                'password' => 'Una-Clave-Larga-1!',
                'password_confirmation' => 'Una-Clave-Larga-1!',
                'enviar_bienvenida' => '0',
            ])
            ->assertSessionHasNoErrors();

        Mail::assertNothingSent();
        $user = User::where('email', 'persona@eurotur.tur.ar')->firstOrFail();
        $this->assertTrue($user->must_change_password);
        $this->assertTrue(Hash::check('Una-Clave-Larga-1!', $user->password));
    }

    public function test_a_failing_mail_never_blocks_the_account_creation(): void
    {
        Mail::shouldReceive('to')->andThrow(new \RuntimeException('smtp caído'));
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Persona',
                'email' => 'persona@eurotur.tur.ar',
                'role_id' => $this->viewerRoleId(),
            ])
            ->assertSessionHasNoErrors();

        $user = User::where('email', 'persona@eurotur.tur.ar')->firstOrFail();
        $this->assertNull($user->welcome_sent_at);
        $this->assertTrue($user->must_change_password);
    }

    public function test_resending_the_welcome_resets_the_password_and_requires_a_change(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();
        $user = User::factory()->viewer()->create(['must_change_password' => false]);
        $oldHash = $user->password;

        $this->actingAs($admin)->post(route('admin.users.bienvenida', $user))->assertRedirect();

        $user->refresh();
        $this->assertTrue($user->must_change_password);
        $this->assertNotSame($oldHash, $user->password);
        Mail::assertSent(WelcomeMail::class, fn (WelcomeMail $mail): bool => Hash::check($mail->temporaryPassword, $user->password));
    }

    public function test_only_people_who_manage_users_can_create_or_resend(): void
    {
        Mail::fake();
        $viewer = User::factory()->viewer()->create();

        $this->actingAs($viewer)->post(route('admin.users.bienvenida', $viewer))->assertForbidden();
        $this->actingAs($viewer)->post(route('admin.users.store'), [])->assertForbidden();
        Mail::assertNothingSent();
    }

    public function test_the_welcome_mail_is_redirected_to_the_test_inbox_when_configured(): void
    {
        config(['mail.redirect_to' => 'prueba@eurotur.tur.ar', 'mail.default' => 'array']);
        $user = User::factory()->viewer()->create(['email' => 'real@eurotur.tur.ar']);

        Mail::to($user->email)->send(new WelcomeMail($user, 'Abc123#xyz987'));

        $sent = app('mailer')->getSymfonyTransport();
        $this->assertTrue(method_exists($sent, 'messages'));
        $message = $sent->messages()->last()->getOriginalMessage();
        $this->assertSame('prueba@eurotur.tur.ar', $message->getTo()[0]->getAddress());
        $this->assertStringContainsString('real@eurotur.tur.ar', $message->getSubject());
    }

    public function test_page_names_in_the_welcome_mail_are_human_readable(): void
    {
        $this->assertSame('Innovación', PageOwners::pageName(Permission::InnovacionManage->value));
        $this->assertSame('Tipo de Cambio', PageOwners::pageName(Permission::ExchangeRateManage->value));
        $this->assertSame('Contrataciones', PageOwners::pageName(Permission::SectorContratacionesEdit->value));
    }

    public function test_temporary_passwords_are_long_and_mixed(): void
    {
        $password = TemporaryPassword::generate();

        $this->assertSame(14, strlen($password));
        $this->assertMatchesRegularExpression('/[a-z]/', $password);
        $this->assertMatchesRegularExpression('/[A-Z]/', $password);
        $this->assertMatchesRegularExpression('/[0-9]/', $password);
        $this->assertMatchesRegularExpression('/[^a-zA-Z0-9]/', $password);
        $this->assertNotSame($password, TemporaryPassword::generate());
    }

    // ------------------------------------------------------------- cambio obligatorio

    public function test_a_person_with_a_temporary_password_can_only_change_it_or_leave(): void
    {
        $user = User::factory()->viewer()->create(['must_change_password' => true]);

        $this->actingAs($user)->get('/')->assertRedirect(route('password.force'));
        $this->actingAs($user)->get(route('admin.inicio'))->assertRedirect(route('password.force'));
        $this->actingAs($user)->get('/internal/herramientas/balanz/validar-sesion')->assertUnauthorized();
        $this->actingAs($user)->get(route('password.force'))->assertOk();
    }

    public function test_changing_the_temporary_password_unlocks_the_portal(): void
    {
        $user = User::factory()->viewer()->create(['must_change_password' => true, 'password' => 'Temporal-1234!x']);

        // Igual a la temporal: no.
        $this->actingAs($user)
            ->put(route('password.force.update'), ['password' => 'Temporal-1234!x', 'password_confirmation' => 'Temporal-1234!x'])
            ->assertSessionHasErrors('password');
        // Corta: no.
        $this->actingAs($user)
            ->put(route('password.force.update'), ['password' => 'Corta1!', 'password_confirmation' => 'Corta1!'])
            ->assertSessionHasErrors('password');
        $this->assertTrue($user->fresh()->must_change_password);

        $this->actingAs($user)
            ->put(route('password.force.update'), ['password' => 'Otra-Clave-9876#', 'password_confirmation' => 'Otra-Clave-9876#'])
            ->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertFalse($user->must_change_password);
        $this->assertTrue(Hash::check('Otra-Clave-9876#', $user->password));
        $this->actingAs($user)->get(route('admin.inicio'))->assertOk();
        // Ya no tiene nada que cambiar: la pantalla lo devuelve al portal.
        $this->actingAs($user)->get(route('password.force'))->assertRedirect('/');
    }

    public function test_normal_users_are_not_forced_to_change_their_password(): void
    {
        $user = User::factory()->viewer()->create();

        $this->actingAs($user)->get(route('admin.inicio'))->assertOk();
    }
}
