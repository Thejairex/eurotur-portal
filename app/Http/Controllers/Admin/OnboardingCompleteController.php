<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Marca que el usuario terminó el recorrido guiado del Back Office. Solo se guarda la primera
 * vez: una segunda llamada no pisa la fecha original.
 */
class OnboardingCompleteController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->onboarding_completed_at === null) {
            $user->forceFill(['onboarding_completed_at' => now()])->save();
        }

        return back();
    }
}
