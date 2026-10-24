<?php

use App\Http\Controllers\Admin\BalanzRedirectController;
use App\Http\Controllers\Admin\BigBrotherRedirectController;
use App\Http\Controllers\Admin\Crm\CrmIndexController;
use App\Http\Controllers\Admin\Crm\InvoiceExecutionController;
use App\Http\Controllers\Admin\Crm\InvoiceLoaderHistoryController;
use App\Http\Controllers\Admin\Crm\InvoiceLoaderPageController;
use App\Http\Controllers\Admin\Crm\InvoiceProposalController;
use App\Http\Controllers\Admin\DescargaController;
use App\Http\Controllers\Admin\HerramientaEmbebidaController;
use App\Http\Controllers\Admin\InicioController;
use App\Http\Controllers\Admin\NovedadController;
use App\Http\Controllers\Admin\OrganigramaEditarRedirectController;
use App\Http\Controllers\Admin\PaginasController;
use App\Http\Controllers\Admin\PerfilController;
use App\Http\Controllers\Admin\PrepagosRedirectController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('administracion')->name('admin.')->group(function () {
    // /administracion a secas lleva al Inicio del Back Office.
    Route::redirect('/', '/administracion/inicio');
    Route::get('inicio', InicioController::class)->name('inicio');
    Route::get('paginas', PaginasController::class)->name('paginas');

    // Mi perfil: cada persona edita el suyo; quien administra usuarios puede ver y corregir el de cualquiera.
    Route::get('perfil', [PerfilController::class, 'show'])->name('perfil');
    Route::put('perfil', [PerfilController::class, 'update'])->name('perfil.update');
    Route::post('perfil/foto', [PerfilController::class, 'foto'])->name('perfil.foto');
    Route::delete('perfil/foto', [PerfilController::class, 'quitarFoto'])->name('perfil.foto.quitar');
    Route::middleware('can:users.manage')->prefix('usuarios/{user}/perfil')->name('users.perfil.')->group(function () {
        Route::get('/', [PerfilController::class, 'show'])->name('show');
        Route::put('/', [PerfilController::class, 'update'])->name('update');
        Route::post('foto', [PerfilController::class, 'foto'])->name('foto');
        Route::delete('foto', [PerfilController::class, 'quitarFoto'])->name('foto.quitar');
    });

    // Novedades del sistema: las lee cualquiera; las gestiona quien tenga novedades.manage.
    Route::get('novedades', [NovedadController::class, 'index'])->name('novedades');
    Route::middleware('can:novedades.manage')->prefix('novedades')->name('novedades.')->group(function () {
        Route::post('/', [NovedadController::class, 'store'])->name('store');
        Route::put('{novedad}', [NovedadController::class, 'update'])->name('update');
        Route::delete('{novedad}', [NovedadController::class, 'destroy'])->name('destroy');
    });

    // Archivos para descargar: los baja cualquiera con sesion; los gestiona quien tenga descargas.manage.
    Route::get('descargas', [DescargaController::class, 'index'])->name('descargas');
    Route::get('descargas/{descarga}/archivo', [DescargaController::class, 'download'])->name('descargas.download');
    Route::middleware('can:descargas.manage')->prefix('descargas')->name('descargas.')->group(function () {
        Route::post('/', [DescargaController::class, 'store'])->name('store');
        Route::put('{descarga}', [DescargaController::class, 'update'])->name('update');
        Route::delete('{descarga}', [DescargaController::class, 'destroy'])->name('destroy');
    });

    Route::middleware('can:users.manage')->group(function () {
        Route::resource('usuarios', UserController::class)
            ->parameters(['usuarios' => 'user'])
            ->except('show')
            ->names('users');
    });

    Route::middleware('can:roles.manage')->group(function () {
        Route::resource('roles', RoleController::class)->except('show');
    });

    Route::middleware('can:prepagos.manage')->get('prepagos', PrepagosRedirectController::class)->name('prepagos');

    Route::middleware('can:balanz.manage')->get('balanz', BalanzRedirectController::class)->name('balanz');

    Route::middleware('can:big-brother.ver')->get('big-brother', BigBrotherRedirectController::class)->name('big-brother');

    Route::middleware('can:organigrama.editar')->get('organigrama', OrganigramaEditarRedirectController::class)->name('organigrama');

    // Una herramienta externa mostrada DENTRO del Back Office (misma pestaña, menu al costado). El permiso
    // lo chequea el controlador, segun la herramienta. Las rutas de arriba siguen abriendola directo.
    Route::get('herramientas/{herramienta}', HerramientaEmbebidaController::class)->name('herramientas.embebida');

    Route::middleware('can:herramientas.view')->prefix('crm')->name('crm.')->group(function () {
        Route::get('/', CrmIndexController::class)->name('index');

        // Pre-Balance de Modulos: herramienta de Contabilidad, dentro del Back Office.
        Route::inertia('pre-balance', 'admin/crm/prebalance')
            ->middleware('can:prebalance.use')
            ->name('prebalance');

        Route::middleware('can:invoice-loader.manage')->prefix('cargador-facturas')->name('invoice-loader.')->group(function () {
            Route::get('/', [InvoiceLoaderPageController::class, 'index'])->name('index');

            Route::post('propuestas', [InvoiceProposalController::class, 'store'])->name('proposals.store');
            Route::get('propuestas/{jobId}', [InvoiceProposalController::class, 'show'])->name('proposals.show');
            Route::get('propuestas/{jobId}/archivo', [InvoiceProposalController::class, 'download'])->name('proposals.download');

            Route::post('ejecuciones', [InvoiceExecutionController::class, 'store'])->name('executions.store');
            Route::get('ejecuciones/{jobId}', [InvoiceExecutionController::class, 'show'])->name('executions.show');
            Route::get('ejecuciones/{jobId}/reporte', [InvoiceExecutionController::class, 'report'])->name('executions.report');
            Route::get('ejecuciones/{jobId}/log', [InvoiceExecutionController::class, 'log'])->name('executions.log');

            Route::prefix('historico')->name('history.')->group(function () {
                Route::get('/', [InvoiceLoaderHistoryController::class, 'index'])->name('index');
                Route::get('{invoiceLoaderJob}/archivo', [InvoiceLoaderHistoryController::class, 'file'])->name('file');
                Route::get('{invoiceLoaderJob}/reporte', [InvoiceLoaderHistoryController::class, 'report'])->name('report');
                Route::get('{invoiceLoaderJob}/log', [InvoiceLoaderHistoryController::class, 'log'])->name('log');
                Route::post('{invoiceLoaderJob}/revisar', [InvoiceLoaderHistoryController::class, 'recheck'])->name('recheck');
            });
        });
    });
});
