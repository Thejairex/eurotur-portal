<?php

namespace App\Http\Requests\Portal;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreIniciativaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'n' => ['required', 'string', 'max:255'],
            'badge' => ['required', 'string', 'max:100'],
            'cls' => ['required', Rule::in(['prod', 'live', 'dev', 'test', 'curso', 'ana', 'cero'])],
            'desc' => ['required', 'string'],
            'url' => ['nullable', 'url', 'max:2048', 'prohibits:file'],
            'file' => ['nullable', 'file', 'max:10240', 'mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,gif', 'prohibits:url'],
        ];
    }
}
