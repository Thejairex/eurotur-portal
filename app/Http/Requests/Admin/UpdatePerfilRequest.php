<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePerfilRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Texto plano: se quitan etiquetas HTML y espacios sobrantes antes de validar.
     */
    protected function prepareForValidation(): void
    {
        foreach (['puesto', 'area', 'sede', 'interno'] as $campo) {
            $valor = $this->input($campo);

            $this->merge([
                $campo => is_string($valor) && trim(strip_tags($valor)) !== '' ? trim(strip_tags($valor)) : null,
            ]);
        }
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'puesto' => ['nullable', 'string', 'max:120'],
            'area' => ['nullable', 'string', 'max:120'],
            'sede' => ['nullable', 'string', 'max:80'],
            'interno' => ['nullable', 'string', 'max:20', 'regex:/^[0-9A-Za-z\- ]+$/'],
        ];
    }
}
