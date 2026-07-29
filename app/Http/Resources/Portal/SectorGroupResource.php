<?php

namespace App\Http\Resources\Portal;

use App\Models\SectorGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property SectorGroup $resource
 */
class SectorGroupResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'title' => $this->resource->title,
            'items' => SectorItemResource::collection($this->resource->items),
        ];
    }
}
