<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FotoPerfilRequest;
use App\Http\Requests\Admin\UpdatePerfilRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Perfil de cada persona en el Back Office. Cada una edita el suyo (foto e interno; el mail es el
 * de su usuario y no se cambia acá). Puesto, área y sede los edita RRHH (permiso del organigrama)
 * o quien administra usuarios. Quien administra usuarios también puede ver y corregir el de
 * cualquiera, desde la lista de Usuarios.
 */
class PerfilController extends Controller
{
    public function show(Request $request, ?User $user = null): Response
    {
        $objetivo = $this->objetivo($request, $user);

        return Inertia::render('admin/perfil', [
            'perfil' => [
                'id' => $objetivo->id,
                'name' => $objetivo->name,
                'email' => $objetivo->email,
                'puesto' => $objetivo->puesto,
                'area' => $objetivo->area,
                'sede' => $objetivo->sede,
                'interno' => $objetivo->interno,
                'foto' => $objetivo->foto_path ? '/storage/'.$objetivo->foto_path : null,
            ],
            'esPropio' => $objetivo->is($request->user()),
            'puedeEditarPuesto' => $this->puedeEditarPuesto($request->user()),
        ]);
    }

    public function update(UpdatePerfilRequest $request, ?User $user = null): RedirectResponse
    {
        $objetivo = $this->objetivo($request, $user);
        $datos = ['interno' => $request->validated('interno')];

        if ($this->puedeEditarPuesto($request->user())) {
            $datos['puesto'] = $request->validated('puesto');
            $datos['area'] = $request->validated('area');
            $datos['sede'] = $request->validated('sede');
        }

        $objetivo->forceFill($datos)->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Perfil actualizado.')]);

        return back();
    }

    public function foto(FotoPerfilRequest $request, ?User $user = null): RedirectResponse
    {
        $objetivo = $this->objetivo($request, $user);
        $archivo = $request->file('foto');
        $medidas = getimagesize($archivo->getRealPath());

        // El navegador la entrega redimensionada a 400 px; acá se verifica igual, sin confiar en él.
        if ($medidas === false || min($medidas[0], $medidas[1]) < 64 || max($medidas[0], $medidas[1]) > 600) {
            return back()->withErrors(['foto' => __('La foto debe medir entre 64 y 600 píxeles de lado.')]);
        }

        $nombre = $objetivo->id.'-'.Str::random(12).'.webp';
        Storage::disk('public')->putFileAs('perfiles', $archivo, $nombre);

        $this->borrarFoto($objetivo);
        $objetivo->forceFill(['foto_path' => 'perfiles/'.$nombre])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Foto actualizada.')]);

        return back();
    }

    public function quitarFoto(Request $request, ?User $user = null): RedirectResponse
    {
        $objetivo = $this->objetivo($request, $user);

        $this->borrarFoto($objetivo);
        $objetivo->forceFill(['foto_path' => null])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Foto quitada.')]);

        return back();
    }

    /** El perfil sobre el que se trabaja: el propio, o el de otra persona si se administran usuarios. */
    private function objetivo(Request $request, ?User $user): User
    {
        if ($user === null || $user->is($request->user())) {
            return $request->user();
        }

        Gate::authorize(Permission::UsersManage->value);

        return $user;
    }

    private function puedeEditarPuesto(User $actor): bool
    {
        return $actor->can(Permission::OrganigramaEditar->value) || $actor->can(Permission::UsersManage->value);
    }

    private function borrarFoto(User $usuario): void
    {
        if ($usuario->foto_path !== null) {
            Storage::disk('public')->delete($usuario->foto_path);
        }
    }
}
