<?php

namespace App\Http\Requests\Admin;

use App\Enums\Permission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreDescargaRequest extends FormRequest
{
    /** Tipos permitidos (extensión y contenido real). */
    public const EXTENSIONES = ['pdf', 'xlsx', 'docx', 'zip', 'png', 'jpg', 'jpeg'];

    public function authorize(): bool
    {
        return $this->user()->can(Permission::DescargasManage->value);
    }

    protected function prepareForValidation(): void
    {
        $nombre = $this->input('nombre');

        $this->merge([
            'nombre' => is_string($nombre) && trim(strip_tags($nombre)) !== '' ? trim(strip_tags($nombre)) : null,
        ]);
    }

    /**
     * Hasta 20 MB; solo los tipos de la lista, comprobados por el contenido y por la extensión.
     *
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'archivo' => ['required', 'file', 'mimes:'.implode(',', self::EXTENSIONES), 'max:20480'],
            'nombre' => ['nullable', 'string', 'max:160'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $archivo = $this->file('archivo');

                if ($archivo !== null && ! in_array(strtolower($archivo->getClientOriginalExtension()), self::EXTENSIONES, true)) {
                    $validator->errors()->add('archivo', __('Ese tipo de archivo no está permitido.'));
                }
            },
        ];
    }
}
