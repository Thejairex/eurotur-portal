<?php

namespace App\Http\Resources\Portal;

use App\Models\Frente;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Frente $resource
 */
class FrenteResource extends JsonResource
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
            'area' => $this->resource->area,
            'owner' => $this->resource->owner,
            'items' => IniciativaResource::collection($this->resource->iniciativas),
        ];
    }
}
