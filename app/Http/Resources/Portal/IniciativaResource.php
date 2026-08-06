<?php

namespace App\Http\Resources\Portal;

use App\Models\Iniciativa;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Iniciativa $resource
 */
class IniciativaResource extends JsonResource
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
            'n' => $this->resource->n,
            'badge' => $this->resource->badge,
            'cls' => $this->resource->cls,
            'desc' => $this->resource->desc,
            'docHref' => $this->resource->resolvedUrl(),
        ];
    }
}
