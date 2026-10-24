<?php

namespace App\Http\Requests\Admin;

use App\Enums\Permission;
use Illuminate\Foundation\Http\FormRequest;

class StoreNovedadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can(Permission::NovedadesManage->value);
    }

    /**
     * Texto plano: se quitan las etiquetas HTML antes de validar.
     */
    protected function prepareForValidation(): void
    {
        foreach (['titulo', 'texto'] as $campo) {
            $valor = $this->input($campo);

            if (is_string($valor)) {
                $this->merge([$campo => trim(strip_tags($valor))]);
            }
        }
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'fecha' => ['required', 'date'],
            'titulo' => ['required', 'string', 'max:160'],
            'texto' => ['required', 'string', 'max:1000'],
        ];
    }
}
