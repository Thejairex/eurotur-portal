<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Mail\WelcomeMail;
use App\Models\Role;
use App\Models\User;
use App\Services\PageOwners;
use App\Services\TemporaryPassword;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->with('role:id,name,slug')
                ->orderBy('name')
                ->paginate(20)
                ->through(fn (User $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role?->only(['id', 'name', 'slug']),
                ]),
            'roles' => $this->roleOptions(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'roles' => $this->roleOptions(),
            'pages' => $this->pageOptions(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $temporary = blank($data['password'] ?? null) ? TemporaryPassword::generate() : (string) $data['password'];

        $user = User::create([
            ...Arr::only($data, ['name', 'email', 'role_id', 'prepagos_analista_codigo']),
            'password' => $temporary,
        ]);
        // La contraseña de un usuario nuevo es siempre temporal: la cambia en el primer ingreso.
        $user->forceFill(['must_change_password' => true])->save();

        // Las páginas tildadas más las que le corresponden por el mapa de responsables (por correo).
        PageOwners::sync($user, array_values(array_map('strval', [...($data['paginas'] ?? []), ...PageOwners::mappedFor($user->email)])));

        if ($request->boolean('enviar_bienvenida', true)) {
            $message = $this->sendWelcome($user, $temporary)
                ? __('Usuario creado. Le mandamos el correo de bienvenida.')
                : __('Usuario creado, pero no se pudo enviar el correo de bienvenida. Usá «Reenviar bienvenida» desde su ficha.');
        } else {
            $message = __('Usuario creado. No se mandó correo: la contraseña es la que definiste y la cambia al entrar.');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return to_route('admin.users.index');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => [
                ...$user->only(['id', 'name', 'email', 'role_id', 'prepagos_analista_codigo']),
                'paginas' => $user->extraPermissionSlugs(),
                'welcome_sent_at' => $user->welcome_sent_at?->toIso8601String(),
                'must_change_password' => $user->must_change_password,
            ],
            'roles' => $this->roleOptions(),
            'pages' => $this->pageOptions(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $attributes = Arr::except($request->validated(), ['paginas']);

        if (blank($attributes['password'] ?? null)) {
            unset($attributes['password']);
        }

        $user->update($attributes);

        // Una contraseña definida por quien administra es temporal: la persona la cambia al entrar.
        if (isset($attributes['password'])) {
            $user->forceFill(['must_change_password' => true])->save();
        }

        // El formulario manda siempre `paginas_form`: sin ninguna tildada significa "ninguna".
        if ($request->has('paginas_form')) {
            PageOwners::sync($user, array_values(array_map('strval', (array) $request->input('paginas', []))));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Usuario actualizado.')]);

        return to_route('admin.users.index');
    }

    /**
     * Genera una contraseña temporal nueva, obliga a cambiarla al entrar y vuelve a mandar la bienvenida.
     */
    public function resendWelcome(User $user): RedirectResponse
    {
        $temporary = TemporaryPassword::generate();

        $user->forceFill(['password' => $temporary, 'must_change_password' => true])->save();

        $message = $this->sendWelcome($user, $temporary)
            ? __('Le mandamos de nuevo la bienvenida, con una contraseña temporal nueva.')
            : __('No se pudo enviar el correo. La contraseña temporal quedó reiniciada; probá de nuevo en unos minutos.');

        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is($request->user()), 403, __('No podés eliminar tu propia cuenta.'));

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Usuario eliminado.')]);

        return to_route('admin.users.index');
    }

    /**
     * El correo se manda en el momento (no por la cola) para que la contraseña no quede en la tabla de
     * trabajos. Si el envío falla, el alta igual queda hecha y se avisa para reenviar.
     */
    private function sendWelcome(User $user, string $password): bool
    {
        try {
            Mail::to($user->email)->send(new WelcomeMail($user, $password));
            $user->forceFill(['welcome_sent_at' => now()])->save();

            return true;
        } catch (Throwable $e) {
            report($e);

            return false;
        }
    }

    /**
     * @return list<array{slug: string, label: string}>
     */
    private function pageOptions(): array
    {
        $options = [];

        foreach (PageOwners::grantable() as $slug => $label) {
            $options[] = ['slug' => $slug, 'label' => $label];
        }

        return $options;
    }

    /**
     * @return Collection<int, array{id: int, name: string, slug: string, ver_bandeja: bool}>
     */
    private function roleOptions(): Collection
    {
        return Role::query()->orderBy('name')->get(['id', 'name', 'slug'])
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'ver_bandeja' => in_array(Permission::PrepagosVerBandeja->value, $role->permissionSlugs(), true),
            ]);
    }
}
