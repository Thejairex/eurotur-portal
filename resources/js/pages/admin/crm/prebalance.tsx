import AdmPrebalance from '@/pages/portal/adm-prebalance';

/**
 * Pre-Balance de Módulos dentro del Back Office (Herramientas).
 *
 * La herramienta en sí (reportes de Tango → Excel con los 15 controles, todo
 * en el navegador) vive en pages/portal/adm-prebalance.tsx y está pintada
 * con los colores fijos del portal (negro sobre blanco). El Back Office
 * puede estar en modo oscuro, así que se la muestra sobre un panel blanco
 * para que se lea igual en los dos modos.
 */
export default function PrebalanceTool() {
    return (
        <div className="eurotur-portal border border-border bg-white px-8 pt-6 pb-10 text-black">
            <AdmPrebalance />
        </div>
    );
}
