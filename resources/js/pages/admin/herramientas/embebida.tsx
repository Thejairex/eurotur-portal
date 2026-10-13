import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/backoffice/page-header';

type Props = {
    label: string;
    area: string;
    /** Dirección de la herramienta en modo embebido (?embebido=1). */
    src: string;
    /** Dirección normal, para "abrir en una pestaña nueva". */
    abrirEn: string;
};

/**
 * Muestra una herramienta externa (otro contenedor, otro puerto) dentro del Back Office:
 * en la misma pestaña, con el menú del Back Office al costado. La herramienta se ve en un
 * marco y, en modo embebido, oculta su propio menú y cabecera.
 */
export default function HerramientaEmbebida({
    label,
    area,
    src,
    abrirEn,
}: Props) {
    return (
        <>
            <Head title={label} />

            <PageHeader
                eyebrow={area}
                title={label}
                action={
                    <a
                        href={abrirEn}
                        target="_blank"
                        rel="noreferrer"
                        className="bo-label transition-colors duration-[120ms] hover:text-primary"
                    >
                        Abrir en pestaña nueva ↗
                    </a>
                }
            />

            <iframe
                title={label}
                src={src}
                className="mt-4 w-full border border-border bg-white"
                style={{ height: 'calc(100vh - 11rem)', minHeight: '520px' }}
            />
        </>
    );
}
