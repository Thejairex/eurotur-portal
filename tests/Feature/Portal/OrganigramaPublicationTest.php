<?php

namespace Tests\Feature\Portal;

use App\Models\Frente;
use App\Models\SectorGroup;
use App\Models\SectorItem;
use Database\Seeders\FrenteSeeder;
use Database\Seeders\SectorLinksSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganigramaPublicationTest extends TestCase
{
    use RefreshDatabase;

    private const MIGRATION = 'database/migrations/2026_10_14_120000_publish_organigrama_portal_entries.php';

    private const DRIVE = 'https://drive.google.com/drive/u/0/folders/1YBH-WESU1sBqR1v6VjPDlpH0fwtTAfcV';

    public function test_the_seeders_publish_the_organigrama_in_rrhh_travel_designers_and_innovacion(): void
    {
        $this->seed(SectorLinksSeeder::class);
        $this->seed(FrenteSeeder::class);

        $this->assertPublished();
    }

    public function test_the_migration_updates_an_already_seeded_database_with_the_old_drive_link(): void
    {
        $this->seed(SectorLinksSeeder::class);
        $this->seed(FrenteSeeder::class);

        // Simulate the pre-existing database: RRHH still pointed to the Drive folder and the
        // Travel Designers / Innovación entries did not exist.
        SectorItem::query()->where('label', 'Organigrama Eurotur — carpeta anterior (PDF)')->delete();
        SectorItem::query()->where('label', 'Organigrama Eurotur')->update(['url' => self::DRIVE, 'keywords' => null]);
        SectorGroup::query()->where('sector', 'traveldesigners')->where('title', 'Organigrama')->delete();
        Frente::query()->where('area', 'Recursos Humanos · Organigrama')->delete();

        $this->runMigration();

        $this->assertPublished();
    }

    public function test_the_migration_is_idempotent_over_the_seeded_content(): void
    {
        $this->seed(SectorLinksSeeder::class);
        $this->seed(FrenteSeeder::class);

        $this->runMigration();
        $this->runMigration();

        $this->assertPublished();
    }

    public function test_the_migration_leaves_alone_a_link_an_editor_already_pointed_at_the_portal_route(): void
    {
        $this->seed(SectorLinksSeeder::class);

        $before = SectorItem::query()->where('label', 'Organigrama Eurotur')->firstOrFail();
        $this->assertSame('/organigrama', $before->url);

        $this->runMigration();

        $after = SectorItem::query()->where('label', 'Organigrama Eurotur')->get();
        $this->assertCount(1, $after);
        $this->assertSame('/organigrama', $after->first()?->url);
    }

    private function runMigration(): void
    {
        (require base_path(self::MIGRATION))->up();
    }

    private function assertPublished(): void
    {
        $rrhh = SectorGroup::query()->where('sector', 'rrhh')->where('title', 'Organigrama')->firstOrFail();
        $labels = $rrhh->items()->pluck('url', 'label');

        $this->assertSame('/organigrama', $labels['Organigrama Eurotur']);
        $this->assertSame(self::DRIVE, $labels['Organigrama Eurotur — carpeta anterior (PDF)']);
        $this->assertStringContainsString(
            'quién es quién',
            (string) $rrhh->items()->where('label', 'Organigrama Eurotur')->first()?->keywords,
        );

        $td = SectorGroup::query()->where('sector', 'traveldesigners')->where('title', 'Organigrama')->get();
        $this->assertCount(1, $td);
        $this->assertSame('/organigrama?empresa=TD', $td->first()?->items()->where('label', 'Organigrama Travel Designers')->first()?->url);
        $this->assertCount(1, SectorItem::query()->where('label', 'Organigrama Travel Designers')->get());

        $frente = Frente::query()->where('area', 'Recursos Humanos · Organigrama')->get();
        $this->assertCount(1, $frente);
        $this->assertCount(1, $frente->first()?->iniciativas()->where('n', 'Organigrama interactivo')->get() ?? []);
    }
}
