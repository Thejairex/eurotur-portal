import type { ReactNode } from 'react';

/**
 * Línea "MANTIENE — … · ACTUALIZADO … POR …" del pie de cada página: Space Mono chico, en
 * mayúsculas, alineada a la derecha y pegada a la línea de arriba del pie. Va al final de la
 * página (marginTop: auto la empuja abajo cuando el contenido es corto).
 */
export function MaintLine({ children }: { children: ReactNode }) {
    return (
        <div
            data-testid="maint-line"
            style={{
                marginTop: 'auto',
                paddingTop: '34px',
            }}
        >
            <div
                style={{
                    textAlign: 'right',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#6B6B68',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #000',
                }}
            >
                mantiene — {children}
            </div>
        </div>
    );
}
