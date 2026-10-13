<?php

namespace App\Http\Controllers\Internal;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

/**
 * Generic session check for tools hosted outside the portal (own container,
 * own port) that sit behind an nginx reverse proxy. It generalises what
 * PrepagosSessionController does for the Panel de Prepagos: the proxy calls
 * this endpoint with `auth_request`, forwarding the browser's own cookie, and
 * only lets the request through when the portal answers 200.
 *
 * To plug in a new tool, add one line to TOOLS (slug => the permission that
 * unlocks it) and point its proxy's `auth_request` at
 * /internal/herramientas/{slug}/validar-sesion.
 *
 * Like the Prepagos endpoint it answers 200 or 401 — never a redirect, since
 * `auth_request` only understands 2xx/401/403.
 */
class HerramientaSessionController extends Controller
{
    /**
     * @var array<string, Permission>
     */
    private const TOOLS = [
        'balanz' => Permission::BalanzManage,
    ];

    public function __invoke(Request $request, string $herramienta): Response
    {
        $permission = self::TOOLS[$herramienta] ?? null;

        abort_if($permission === null, 404);

        $user = $request->user();

        abort_unless($user !== null && $user->can($permission->value), 401);

        return response('', 200, [
            // ASCII-folded for the same reason as in PrepagosSessionController:
            // header values are decoded as Latin-1 by the Python stacks behind
            // the proxy, so raw UTF-8 would arrive mangled.
            'X-Portal-Usuario' => Str::ascii($user->name),
            'X-Portal-Rol' => $user->role === null ? '' : Str::ascii($user->role->name),
        ]);
    }
}
