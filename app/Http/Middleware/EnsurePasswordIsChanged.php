<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Mientras la persona tenga una contraseña temporal (usuario recién creado o con la clave reiniciada),
 * lo único que puede hacer es cambiarla o salir. Las comprobaciones de sesión que hacen las herramientas
 * externas (Balanz, Big Brother, Organigrama, Prepagos) responden 401: no se abren sin cambiar la clave.
 */
class EnsurePasswordIsChanged
{
    /** Rutas que se pueden usar con la contraseña temporal. */
    private const ALLOWED = ['password.force', 'password.force.update', 'logout'];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ! $user->must_change_password) {
            return $next($request);
        }

        if ($request->routeIs(self::ALLOWED)) {
            return $next($request);
        }

        if ($request->is('internal/*')) {
            abort(401);
        }

        return redirect()->route('password.force');
    }
}
