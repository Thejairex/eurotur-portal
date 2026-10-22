<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class FotoPerfilRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * La foto llega ya redimensionada y en webp desde el navegador: se acepta solo webp y liviana.
     *
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'foto' => ['required', 'file', 'mimetypes:image/webp', 'max:512'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'foto.required' => 'Elegí una foto.',
            'foto.mimetypes' => 'La foto tiene que ser JPG, PNG o WebP.',
            'foto.max' => 'La foto pesa demasiado.',
        ];
    }
}
