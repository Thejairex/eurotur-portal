<?php

namespace App\Http\Requests\Admin;

use App\Enums\Permission;
use Illuminate\Foundation\Http\FormRequest;

class RenameDescargaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can(Permission::DescargasManage->value);
    }

    protected function prepareForValidation(): void
    {
        $nombre = $this->input('nombre');

        if (is_string($nombre)) {
            $this->merge(['nombre' => trim(strip_tags($nombre))]);
        }
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:160'],
        ];
    }
}
