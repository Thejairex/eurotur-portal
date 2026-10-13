<?php

namespace Tests\Feature\Portal;

use App\Models\Frente;
use App\Models\SectorGroup;
use App\Models\SectorItem;
use Database\Seeders\FrenteSeeder;
use Database\Seeders\SectorLinksSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The Pre-Balance entries reach a fresh database through the seeders and an
 * already-seeded one through a data migration. Both paths must agree, and
 * running them twice must not duplicate anything.
 */
class PrebalancePublicationTest extends TestCase
{
    use RefreshDatabase;

    private const MIGRATION = 'database/migrations/2026_08_10_133658_publish_prebalance_modulos_portal_entries.php';

    private const REMOVAL_MIGRATION = 'database/migrations/2026_10_13_120000_remove_prebalance_tool_link_from_adm_sector.php';

    public function test_the_seeders_publish_the_tool_across_adm_responsables_and_innovacion(): void
    {
        $this->seed(SectorLinksSeeder::class);
        $this->seed(FrenteSeeder::class);

        // The tool link itself is no longer seeded: it lives in Back Office > Herramientas.
        $this->assertPublished(toolListed: false);
    }

    public function test_the_data_migration_publishes_the_tool_on_an_already_seeded_database(): void
    {
        $this->seed(SectorLinksSeeder::class);
        $this->seed(FrenteSeeder::class);

        // Simulate the pre-existing database: the entries were not seeded yet.
        SectorItem::query()->whereIn('label', [
            'Pre-Balance de Módulos — herramienta',
            'Pre-Balance de Módulos — documentación',
            'Pre-Balance de Módulos — cómo se usa',
        ])->delete();
        SectorGroup::query()->whereIn('title', ['Contabilidad · Cierre mensual', 'Contabilidad · Pre-Balance'])->delete();
        Frente::query()->where('area', 'Contabilidad · Cierre mensual')->delete();

        $this->runDataMigration();

        $this->assertPublished(toolListed: true);
    }

    public function test_the_data_migration_is_idempotent_over_the_seeded_content(): void
    {
        $this->seed(SectorLinksSeeder::class);
        $this->seed(FrenteSeeder::class);

        $this->runDataMigration();
        $this->runDataMigration();

        $this->assertPublished(toolListed: true);
    }

    public function test_the_follow_up_migration_removes_the_tool_link_from_the_adm_sector(): void
    {
        $this->seed(SectorLinksSeeder::class);
        $this->seed(FrenteSeeder::class);
        $this->runDataMigration();

        $this->assertCount(1, SectorItem::query()->where('url', '/adm/prebalance')->get());

        (require base_path(self::REMOVAL_MIGRATION))->up();

        $this->assertSame(0, SectorItem::query()->where('url', '/adm/prebalance')->count());
        // The public documentation entry stays.
        $this->assertCount(1, SectorItem::query()->where('label', 'Pre-Balance de Módulos — documentación')->get());
    }

    private function runDataMigration(): void
    {
        (require base_path(self::MIGRATION))->up();
    }

    private function assertPublished(bool $toolListed): void
    {
        $block = SectorGroup::query()
            ->where('sector', 'adm')
            ->where('title', 'Contabilidad · Cierre mensual')
            ->get();

        $this->assertCount(1, $block, 'The adm block must exist exactly once.');

        $tool = SectorItem::query()->where('label', 'Pre-Balance de Módulos — herramienta')->get();

        if ($toolListed) {
            $this->assertCount(1, $tool);
            $this->assertSame('/adm/prebalance', $tool->first()?->url);
            $this->assertSame('En prueba — Contabilidad', $tool->first()?->badge);
            $this->assertStringContainsString('prebalance', (string) $tool->first()?->keywords);
        } else {
            $this->assertCount(0, $tool);
        }

        $this->assertCount(1, SectorItem::query()->where('label', 'Pre-Balance de Módulos — documentación')->get());

        // Added to the existing "Instructivos" block, next to the untouched entry.
        $instructivos = SectorGroup::query()
            ->where('sector', 'adm')
            ->where('title', 'Instructivos')
            ->firstOrFail();
        $labels = $instructivos->items()->pluck('label');
        $this->assertContains('Cierre de módulo mensual', $labels);
        $this->assertSame(1, $labels->filter(fn (string $l) => $l === 'Pre-Balance de Módulos — cómo se usa')->count());

        // The new adm block sits last, and responsables gets a 13th row.
        $this->assertSame(
            'Contabilidad · Cierre mensual',
            SectorGroup::query()->where('sector', 'adm')->orderByDesc('sort_order')->first()?->title,
        );
        $responsables = SectorGroup::query()->where('sector', 'responsables')->orderBy('sort_order')->get();
        $this->assertCount(13, $responsables);
        $this->assertSame('Contabilidad · Pre-Balance', $responsables->last()?->title);

        $frentes = Frente::query()->where('area', 'Contabilidad · Cierre mensual')->get();
        $this->assertCount(1, $frentes);
        $this->assertSame('E. Quintana · N. Basualdo', $frentes->first()?->owner);
        $iniciativas = $frentes->first()?->iniciativas()->get();
        $this->assertCount(1, $iniciativas);
        $this->assertSame('En prueba', $iniciativas?->first()?->badge);
        $this->assertSame('test', $iniciativas?->first()?->cls);
    }
}
