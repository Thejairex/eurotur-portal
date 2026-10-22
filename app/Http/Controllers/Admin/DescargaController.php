<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RenameDescargaRequest;
use App\Http\Requests\Admin\StoreDescargaRequest;
use App\Models\Descarga;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Archivos para descargar desde el Back Office. Los archivos se guardan fuera de la carpeta pública
 * y solo se entregan con la sesión iniciada. Quien tiene el permiso `descargas.manage` los sube,
 * renombra y borra.
 */
class DescargaController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/descargas', [
            'archivos' => Descarga::query()
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->get()
                ->map(fn (Descarga $descarga) => [
                    'id' => $descarga->id,
                    'nombre' => $descarga->nombre,
                    'extension' => $descarga->extension,
                    'tamano' => $descarga->tamano,
                ]),
            'puedeAdministrar' => $request->user()->can(Permission::DescargasManage->value),
        ]);
    }

    public function store(StoreDescargaRequest $request): RedirectResponse
    {
        $archivo = $request->file('archivo');
        $extension = strtolower($archivo->getClientOriginalExtension());
        $guardado = Storage::disk('local')->putFileAs('descargas', $archivo, Str::uuid().'.'.$extension);

        Descarga::create([
            'nombre' => $request->validated('nombre') ?: pathinfo($archivo->getClientOriginalName(), PATHINFO_FILENAME),
            'archivo' => $guardado,
            'nombre_original' => $archivo->getClientOriginalName(),
            'extension' => $extension,
            'tamano' => $archivo->getSize(),
            'subido_por' => $request->user()->id,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Archivo subido.')]);

        return back();
    }

    public function update(RenameDescargaRequest $request, Descarga $descarga): RedirectResponse
    {
        $descarga->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Archivo renombrado.')]);

        return back();
    }

    public function destroy(Descarga $descarga): RedirectResponse
    {
        $this->autorizar();

        Storage::disk('local')->delete($descarga->archivo);
        $descarga->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Archivo eliminado.')]);

        return back();
    }

    public function download(Descarga $descarga): StreamedResponse
    {
        // Nombre de descarga limpio: sin rutas ni caracteres raros, con la extensión real.
        $nombre = Str::limit(preg_replace('/[^\p{L}\p{N} ._()\-]+/u', '', $descarga->nombre) ?: 'archivo', 120, '').'.'.$descarga->extension;

        return Storage::disk('local')->download($descarga->archivo, $nombre, [
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function autorizar(): void
    {
        abort_unless(auth()->user()->can(Permission::DescargasManage->value), 403);
    }
}
