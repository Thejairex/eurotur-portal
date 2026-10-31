<?php

namespace App\Http\Requests\Admin;

use App\Support\Mercados;
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

        // Los mercados llegan como texto separado por comas: se pasan a lista limpia. Si el campo no viene
        // en el pedido, no se toca lo que ya tiene cargado.
        if ($this->has('mercados')) {
            $this->merge(['mercados' => Mercados::normalizar($this->input('mercados'))]);
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
            'mercados' => ['nullable', 'array', 'max:'.Mercados::MAX],
            'mercados.*' => ['string', 'max:'.Mercados::LARGO_MAX],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'mercados.max' => 'Podés cargar hasta '.Mercados::MAX.' mercados.',
            'mercados.*.max' => 'Cada mercado puede tener hasta '.Mercados::LARGO_MAX.' caracteres.',
        ];
    }
}
