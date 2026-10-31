import type { ReactNode } from 'react';

/**
 * Línea "MANTIENE — … · ACTUALIZADO … POR …" del pie de cada página: texto chico, en
 * mayúsculas, alineada a la derecha y pegada a la línea de arriba del pie. Va al final de la
 * página (marginTop: auto la empuja abajo cuando el contenido es corto).
 */
export function MaintLine({ children }: { children: ReactNode }) {
    return (
        <div
            data-testid="maint-line"
            style={{
                marginTop: 'auto',
                paddingTop: '46px',
            }}
        >
            <div
                style={{
                    textAlign: 'right',
                    fontSize: '10.5px',
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                    color: 'var(--p-mut)',
                    paddingBottom: '6px',
                    borderBottom: '1px solid var(--p-rule)',
                }}
            >
                mantiene — {children}
            </div>
        </div>
    );
}
