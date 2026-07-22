<?php

use App\Http\Controllers\Portal\InnovacionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'portal/home')->name('home');
Route::inertia('institucional', 'portal/institucional')->name('portal.institucional');
Route::inertia('rrhh', 'portal/rrhh')->name('portal.rrhh');
Route::inertia('adm', 'portal/adm')->name('portal.adm');
Route::inertia('contrataciones', 'portal/contrataciones')->name('portal.contrataciones');
Route::inertia('operaciones', 'portal/operaciones')->name('portal.operaciones');
Route::inertia('producto', 'portal/producto')->name('portal.producto');
Route::inertia('customercare', 'portal/customercare')->name('portal.customercare');
Route::inertia('qrated', 'portal/qrated')->name('portal.qrated');
Route::inertia('sales', 'portal/sales')->name('portal.sales');
Route::inertia('traveldesigners', 'portal/traveldesigners')->name('portal.traveldesigners');
Route::inertia('it', 'portal/it')->name('portal.it');
Route::inertia('mesa', 'portal/mesa')->name('portal.mesa');
Route::inertia('responsables', 'portal/responsables')->name('portal.responsables');
Route::get('innovacion', InnovacionController::class)->name('portal.innovacion');
