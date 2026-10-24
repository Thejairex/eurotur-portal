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
     * Move a group within its sector: one position up or down (`direction`), or straight to a given
     * place (`position`, 0 = first). The sector's groups are renumbered first so duplicated or gapped
     * sort_order values (from older edits) cannot block the change.
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

        if ($position === false) {
            return back();
        }

        $ordered = $groups->all();

        if ($request->validated('position') !== null) {
            $target = min((int) $request->validated('position'), count($ordered) - 1);
            [$moved] = array_splice($ordered, $position, 1);
            array_splice($ordered, $target, 0, [$moved]);
        } else {
            $target = $request->validated('direction') === 'up' ? $position - 1 : $position + 1;

            if ($target < 0 || $target >= count($ordered)) {
                return back();
            }

            [$ordered[$position], $ordered[$target]] = [$ordered[$target], $ordered[$position]];
        }

        $changed = false;

        foreach ($ordered as $index => $item) {
            if ($item->sort_order !== $index) {
                $item->update(['sort_order' => $index]);
                $changed = true;
            }
        }

        if ($changed) {
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
