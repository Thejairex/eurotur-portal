<?php

namespace App\Http\Controllers\Portal;

use App\Enums\EditableSector;
use App\Http\Controllers\Controller;
use App\Http\Resources\Portal\SectorGroupResource;
use App\Models\SectorGroup;
use Inertia\Inertia;
use Inertia\Response;

class SectorPageController extends Controller
{
    public function rrhh(): Response
    {
        return $this->render(EditableSector::Rrhh);
    }

    public function adm(): Response
    {
        return $this->render(EditableSector::Adm);
    }

    public function contrataciones(): Response
    {
        return $this->render(EditableSector::Contrataciones);
    }

    public function operaciones(): Response
    {
        return $this->render(EditableSector::Operaciones);
    }

    public function producto(): Response
    {
        return $this->render(EditableSector::Producto);
    }

    public function customercare(): Response
    {
        return $this->render(EditableSector::Customercare);
    }

    public function sales(): Response
    {
        return $this->render(EditableSector::Sales);
    }

    public function traveldesigners(): Response
    {
        return $this->render(EditableSector::Traveldesigners);
    }

    public function it(): Response
    {
        return $this->render(EditableSector::It);
    }

    public function responsables(): Response
    {
        return $this->render(EditableSector::Responsables);
    }

    private function render(EditableSector $sector): Response
    {
        $groups = SectorGroup::query()
            ->where('sector', $sector->value)
            ->with('items')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render("portal/{$sector->value}", [
            'groups' => SectorGroupResource::collection($groups),
        ]);
    }
}
