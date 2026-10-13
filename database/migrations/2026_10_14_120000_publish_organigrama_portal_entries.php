<?php

use App\Models\Frente;
use App\Models\SectorGroup;
use Illuminate\Database\Migrations\Migration;

/**
 * Publishes the interactive Organigrama into already-seeded databases:
 *  - RRHH > Organigrama: "Organigrama Eurotur" now points to the stable portal route
 *    /organigrama (which redirects to the app); the old Drive folder stays as a secondary link.
 *  - Travel Designers: new "Organigrama Travel Designers" link (/organigrama?empresa=TD).
 *  - Innovación: new initiative under "Recursos Humanos · Organigrama".
 *
 * New installs get the same content from SectorLinksSeeder / FrenteSeeder, so every change here is
 * idempotent: nothing is duplicated when both paths run, and links an editor already changed by
 * hand are left alone.
 */
return new class extends Migration
{
    private const VIEW_URL = '/organigrama';

    private const TD_URL = '/organigrama?empresa=TD';

    private const KEYWORDS = 'organigrama, estructura, quién es quién, RRHH, dotación, personal, jefes, equipo';

    private const MAIN_ITEM = 'Organigrama Eurotur';

    private const OLD_ITEM = 'Organigrama Eurotur — carpeta anterior (PDF)';

    private const TD_ITEM = 'Organigrama Travel Designers';

    private const GROUP = 'Organigrama';

    private const FRENTE_AREA = 'Recursos Humanos · Organigrama';

    private const INICIATIVA = 'Organigrama interactivo';

    public function up(): void
    {
        // On a fresh install the seeders own this content; there is nothing to backfill.
        if (SectorGroup::query()->where('sector', 'rrhh')->doesntExist()) {
            return;
        }

        $rrhh = $this->group('rrhh', self::GROUP);
        $main = $rrhh->items()->where('label', self::MAIN_ITEM)->first();

        if ($main === null) {
            $rrhh->items()->create([
                'label' => self::MAIN_ITEM,
                'url' => self::VIEW_URL,
                'keywords' => self::KEYWORDS,
                'sort_order' => 0,
            ]);
        } elseif ($main->url !== self::VIEW_URL) {
            // Keep the previous destination (the Drive folder) as a secondary link.
            if ($main->url !== null && $main->url !== '') {
                $rrhh->items()->firstOrCreate(
                    ['label' => self::OLD_ITEM],
                    ['url' => $main->url, 'sort_order' => (int) $rrhh->items()->max('sort_order') + 1],
                );
            }

            $main->update(['url' => self::VIEW_URL, 'keywords' => self::KEYWORDS]);
        }

        if (SectorGroup::query()->where('sector', 'traveldesigners')->exists()) {
            $td = $this->group('traveldesigners', self::GROUP);
            $td->items()->firstOrCreate(
                ['label' => self::TD_ITEM],
                ['url' => self::TD_URL, 'keywords' => self::KEYWORDS, 'sort_order' => (int) $td->items()->max('sort_order') + 1],
            );
        }

        $frente = Frente::query()->firstOrCreate(
            ['area' => self::FRENTE_AREA],
            [
                'owner' => 'V. Homez · R. Velázquez',
                'sort_order' => (int) Frente::query()->max('sort_order') + 1,
            ],
        );

        $frente->iniciativas()->firstOrCreate(
            ['n' => self::INICIATIVA],
            [
                'badge' => 'En prueba',
                'cls' => 'test',
                'desc' => 'Organigrama navegable con foto por persona, ficha, filtros por sector y sede, contratos de temporada y vacantes. RRHH lo edita desde el Back Office, con registro de quién cambió qué. Reemplaza el PDF.',
                'sort_order' => 0,
            ],
        );
    }

    public function down(): void
    {
        SectorGroup::query()
            ->where('sector', 'traveldesigners')
            ->where('title', self::GROUP)
            ->delete();

        Frente::query()->where('area', self::FRENTE_AREA)->delete();
    }

    private function group(string $sector, string $title): SectorGroup
    {
        return SectorGroup::query()->firstOrCreate(
            ['sector' => $sector, 'title' => $title],
            ['sort_order' => (int) SectorGroup::query()->where('sector', $sector)->max('sort_order') + 1],
        );
    }
};
