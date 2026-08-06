<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreFrenteRequest;
use App\Http\Requests\Portal\UpdateFrenteRequest;
use App\Models\Frente;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class FrenteController extends Controller
{
    /**
     * Create a new frente (automation front) in Innovación.
     */
    public function store(StoreFrenteRequest $request): RedirectResponse
    {
        $nextSortOrder = Frente::query()->max('sort_order') + 1;

        Frente::create([
            ...$request->validated(),
            'sort_order' => $nextSortOrder,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Frente agregado.')]);

        return back();
    }

    /**
     * Update a frente's area/owner.
     */
    public function update(Frente $frente, UpdateFrenteRequest $request): RedirectResponse
    {
        $frente->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Frente actualizado.')]);

        return back();
    }

    /**
     * Delete a frente and its iniciativas.
     */
    public function destroy(Frente $frente): RedirectResponse
    {
        $frente->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Frente eliminado.')]);

        return back();
    }
}
