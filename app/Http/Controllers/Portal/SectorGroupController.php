<?php

namespace App\Http\Controllers\Portal;

use App\Enums\EditableSector;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\MoveSectorGroupRequest;
use App\Http\Requests\Portal\StoreSectorGroupRequest;
use App\Http\Requests\Portal\UpdateSectorGroupRequest;
use App\Models\SectorGroup;
use App\Services\SectorUpdates;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class SectorGroupController extends Controller
{
    /**
     * Create a new group (column) within a sector.
     */
    public function store(EditableSector $sector, StoreSectorGroupRequest $request): RedirectResponse
    {
        $nextSortOrder = SectorGroup::query()->where('sector', $sector->value)->max('sort_order') + 1;

        SectorGroup::create([
            ...$request->validated(),
            'sector' => $sector->value,
            'sort_order' => $nextSortOrder,
        ]);

        SectorUpdates::registrar($sector->value);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Grupo agregado.')]);

        return back();
    }

    /**
     * Update a group's title.
     */
    public function update(SectorGroup $group, UpdateSectorGroupRequest $request): RedirectResponse
    {
        $group->update($request->validated());

        SectorUpdates::registrar($group->sector);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Grupo actualizado.')]);

        return back();
    }

    /**
     * Move a group one position up or down within its sector. The sector's groups are renumbered
     * first so duplicated or gapped sort_order values (from older edits) cannot block the swap.
     */
    public function move(SectorGroup $group, MoveSectorGroupRequest $request): RedirectResponse
    {
        $groups = SectorGroup::query()
            ->where('sector', $group->sector)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->values();

        $position = $groups->search(fn (SectorGroup $candidate): bool => $candidate->is($group));
        $target = $request->validated('direction') === 'up' ? $position - 1 : $position + 1;

        if ($position !== false && $target >= 0 && $target < $groups->count()) {
            $ordered = $groups->all();
            [$ordered[$position], $ordered[$target]] = [$ordered[$target], $ordered[$position]];

            foreach ($ordered as $index => $item) {
                if ($item->sort_order !== $index) {
                    $item->update(['sort_order' => $index]);
                }
            }

            SectorUpdates::registrar($group->sector);
        }

        return back();
    }

    /**
     * Delete a group and its items.
     */
    public function destroy(SectorGroup $group): RedirectResponse
    {
        Gate::authorize(Permission::forSector(EditableSector::from($group->sector))->value);

        $group->delete();

        SectorUpdates::registrar($group->sector);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Grupo eliminado.')]);

        return back();
    }
}
