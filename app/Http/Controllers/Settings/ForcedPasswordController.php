<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Cambio obligatorio de contraseña en el primer ingreso (o cuando se la reinicia). No pide la actual
 * porque la persona acaba de entrar con ella; sí exige una nueva y distinta de la temporal.
 */
class ForcedPasswordController extends Controller
{
    public function edit(Request $request): Response|RedirectResponse
    {
        if (! $request->user()->must_change_password) {
            return redirect('/');
        }

        return Inertia::render('auth/cambiar-clave');
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'password' => ['required', 'string', 'min:10', Password::default(), 'confirmed'],
        ]);

        if (Hash::check((string) $request->input('password'), $user->password)) {
            return back()->withErrors(['password' => __('La contraseña nueva tiene que ser distinta de la temporal.')]);
        }

        $user->forceFill([
            'password' => $request->input('password'),
            'must_change_password' => false,
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Contraseña cambiada. ¡Listo!')]);

        return redirect()->intended('/');
    }
}
