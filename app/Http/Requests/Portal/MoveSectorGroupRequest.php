<?php

namespace App\Http\Requests\Portal;

use App\Concerns\AuthorizesSectorEditing;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MoveSectorGroupRequest extends FormRequest
{
    use AuthorizesSectorEditing;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'direction' => ['required_without:position', 'nullable', 'in:up,down'],
            // Posición final (0 = primero), para arrastrar un bloque a cualquier lugar de una vez.
            'position' => ['required_without:direction', 'nullable', 'integer', 'min:0'],
        ];
    }
}
