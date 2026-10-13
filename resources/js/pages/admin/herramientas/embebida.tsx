import { Head } from '@inertiajs/react';

type Props = {
    label: string;
    /** Dirección de la herramienta en modo embebido (?embebido=1). */
    src: string;
    /** Dirección normal, para "abrir en una pestaña nueva". */
    abrirEn: string;
};

/**
 * Muestra una herramienta externa (otro contenedor, otro puerto) dentro del Back Office:
 * en la misma pestaña, con el menú del Back Office al costado. La herramienta se ve en un
 * marco y, en modo embebido, oculta su propio menú y franja pero MANTIENE su título grande (el
 * Back Office no pone otro, para que no quede repetido).
 */
export default function HerramientaEmbebida({ label, src, abrirEn }: Props) {
    return (
        <>
            <Head title={label} />

            <div className="mb-2 flex justify-end">
                <a
                    href={abrirEn}
                    target="_blank"
                    rel="noreferrer"
                    className="bo-label transition-colors duration-[120ms] hover:text-primary"
                >
                    Abrir en pestaña nueva ↗
                </a>
            </div>

            <iframe
                title={label}
                src={src}
                className="w-full border border-border bg-white"
                style={{ height: 'calc(100vh - 9.5rem)', minHeight: '520px' }}
            />
        </>
    );
}
