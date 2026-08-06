<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreIniciativaRequest;
use App\Http\Requests\Portal\UpdateIniciativaRequest;
use App\Models\Frente;
use App\Models\Iniciativa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use RuntimeException;

class IniciativaController extends Controller
{
    /**
     * Create a new iniciativa within a frente.
     */
    public function store(Frente $frente, StoreIniciativaRequest $request): RedirectResponse
    {
        $nextSortOrder = $frente->iniciativas()->max('sort_order') + 1;

        $frente->iniciativas()->create([
            'n' => $request->validated('n'),
            'badge' => $request->validated('badge'),
            'cls' => $request->validated('cls'),
            'desc' => $request->validated('desc'),
            'url' => $request->validated('url'),
            'file_path' => $this->storeFile($request),
            'sort_order' => $nextSortOrder,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Iniciativa agregada.')]);

        return back();
    }

    /**
     * Update an iniciativa's fields, link, or attached file.
     */
    public function update(Iniciativa $iniciativa, UpdateIniciativaRequest $request): RedirectResponse
    {
        $attributes = [
            'n' => $request->validated('n'),
            'badge' => $request->validated('badge'),
            'cls' => $request->validated('cls'),
            'desc' => $request->validated('desc'),
            'sort_order' => $request->validated('sort_order', $iniciativa->sort_order),
        ];

        if ($request->hasFile('file')) {
            if ($iniciativa->file_path !== null) {
                Storage::disk('public')->delete($iniciativa->file_path);
            }

            $attributes['file_path'] = $this->storeFile($request);
            $attributes['url'] = null;
        } elseif ($request->filled('url')) {
            if ($iniciativa->file_path !== null) {
                Storage::disk('public')->delete($iniciativa->file_path);
            }

            $attributes['url'] = $request->validated('url');
            $attributes['file_path'] = null;
        }

        $iniciativa->update($attributes);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Iniciativa actualizada.')]);

        return back();
    }

    /**
     * Delete an iniciativa, removing its uploaded file if present.
     */
    public function destroy(Iniciativa $iniciativa): RedirectResponse
    {
        if ($iniciativa->file_path !== null) {
            Storage::disk('public')->delete($iniciativa->file_path);
        }

        $iniciativa->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Iniciativa eliminada.')]);

        return back();
    }

    private function storeFile(StoreIniciativaRequest|UpdateIniciativaRequest $request): ?string
    {
        if (! $request->hasFile('file')) {
            return null;
        }

        $path = $request->file('file')->store('sector-links', 'public');

        throw_if($path === false, new RuntimeException('Failed to store uploaded file.'));

        return $path;
    }
}
