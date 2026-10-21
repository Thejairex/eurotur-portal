<?php

namespace Tests\Feature\Console;

use App\Models\Frente;
use App\Models\SectorGroup;
use App\Services\PortalContentSnapshot;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalContentSnapshotTest extends TestCase
{
    use RefreshDatabase;

    private function seedContent(): void
    {
        $group = SectorGroup::create(['sector' => 'contrataciones', 'title' => 'Servicios', 'sort_order' => 0]);
        $group->items()->create(['label' => 'Transportistas', 'url' => 'https://example.com/a', 'sort_order' => 0]);
        $group->items()->create(['label' => 'Bases', 'url' => 'https://example.com/b', 'sort_order' => 1]);
        SectorGroup::create(['sector' => 'contrataciones', 'title' => 'Hotelería', 'sort_order' => 1]);

        $frente = Frente::create(['area' => 'Operaciones', 'owner' => 'Valentina', 'sort_order' => 0]);
        $frente->iniciativas()->create(['n' => 'Bot', 'badge' => 'En marcha', 'cls' => 'live', 'desc' => 'Descripción', 'url' => null, 'sort_order' => 0]);
    }

    public function test_export_keeps_the_order_of_groups_and_links(): void
    {
        $this->seedContent();

        $data = (new PortalContentSnapshot)->export();

        $this->assertSame(['Servicios', 'Hotelería'], array_column($data['sectores']['contrataciones'], 'title'));
        $this->assertSame(['Transportistas', 'Bases'], array_column($data['sectores']['contrataciones'][0]['items'], 'label'));
        $this->assertSame('Operaciones', $data['frentes'][0]['area']);
    }

    public function test_import_is_idempotent_and_does_not_overwrite_existing_content(): void
    {
        $this->seedContent();
        $data = (new PortalContentSnapshot)->export();

        $result = (new PortalContentSnapshot)->import($data);

        $this->assertSame('omitido (ya tiene contenido)', $result['contrataciones']);
        $this->assertSame('omitido (ya tiene contenido)', $result['innovacion']);
        $this->assertSame(2, SectorGroup::count());
        $this->assertSame(1, Frente::count());
    }

    public function test_import_loads_an_empty_portal_and_replace_overwrites(): void
    {
        $this->seedContent();
        $data = (new PortalContentSnapshot)->export();

        SectorGroup::query()->delete();
        Frente::query()->delete();

        $result = (new PortalContentSnapshot)->import($data);

        $this->assertSame('cargado', $result['contrataciones']);
        $this->assertSame(['Servicios', 'Hotelería'], SectorGroup::orderBy('sort_order')->pluck('title')->all());
        $this->assertSame(1, Frente::count());

        SectorGroup::query()->orderBy('sort_order')->first()->update(['title' => 'Cambiado a mano']);
        (new PortalContentSnapshot)->import($data, replace: true, only: ['contrataciones']);

        $this->assertSame(['Servicios', 'Hotelería'], SectorGroup::orderBy('sort_order')->pluck('title')->all());
    }

    public function test_commands_round_trip_through_a_json_file(): void
    {
        $this->seedContent();
        $file = 'storage/framework/testing/portal-contenido-test.json';

        $this->artisan('portal:exportar-contenido', ['archivo' => $file])->assertSuccessful();
        SectorGroup::query()->delete();
        $this->artisan('portal:importar-contenido', ['archivo' => $file])->assertSuccessful();

        $this->assertSame(2, SectorGroup::count());

        @unlink(base_path($file));
    }

    public function test_import_command_rejects_a_missing_file(): void
    {
        $this->artisan('portal:importar-contenido', ['archivo' => 'database/content/no-existe.json'])->assertFailed();
    }
}
