import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

const RED = '#E30613';
const REFRESH_MS = 60_000;

type Sensor = {
    nombre: string;
    temperatura: number;
    humedad: number;
    estado: string;
    nivel: 'ok' | 'alerta' | 'desconocido';
};

type Telefono = { nombre: string; numero: string };

type Datos = {
    modo: 'vivo' | 'ejemplo' | 'no-configurado' | 'error';
    sensores: Sensor[];
    telefonos: Telefono[];
    actualizado: string | null;
    desactualizado: boolean;
};

const LEVEL_STYLE: Record<Sensor['nivel'], CSSProperties> = {
    ok: { background: '#e7f5ec', color: '#14612f' },
    alerta: { background: '#fde8ea', color: RED },
    desconocido: { background: '#eee', color: '#555' },
};

const EYEBROW: CSSProperties = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: '#666',
};

const CARD_TITLE: CSSProperties = {
    margin: '10px 0 0',
    fontFamily: "'Archivo', sans-serif",
    fontWeight: 900,
    fontSize: '22px',
    letterSpacing: '-0.01em',
    textTransform: 'uppercase',
};

function formatDecimal(value: number): string {
    return value.toLocaleString('es-AR', { maximumFractionDigits: 1 });
}

function formatReading(sensor: Sensor): string {
    return (
        formatDecimal(sensor.temperatura) +
        ' °C · ' +
        formatDecimal(sensor.humedad) +
        ' %'
    );
}

function formatUpdated(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Sensores y teléfonos de la Mesa de Información, en vivo. Los datos salen de dos hojas de
 * Google que el portal lee desde el servidor; esta pantalla los vuelve a pedir cada minuto.
 */
export function MesaEnVivo() {
    const [datos, setDatos] = useState<Datos | null>(null);
    const [failed, setFailed] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        let active = true;

        const load = () => {
            fetch('/mesa/datos', {
                headers: { Accept: 'application/json' },
                cache: 'no-store',
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('mesa/datos ' + response.status);
                    }

                    return response.json() as Promise<Datos>;
                })
                .then((json) => {
                    if (active) {
                        setDatos(json);
                        setFailed(false);
                    }
                })
                .catch(() => {
                    if (active) {
                        setFailed(true);
                    }
                });
        };

        load();
        const timer = setInterval(load, REFRESH_MS);

        return () => {
            active = false;
            clearInterval(timer);
        };
    }, []);

    const unavailable =
        failed ||
        datos?.modo === 'error' ||
        datos?.modo === 'no-configurado';
    const needle = query.trim().toLowerCase();
    const phones = (datos?.telefonos ?? []).filter(
        (phone) =>
            needle === '' ||
            phone.nombre.toLowerCase().includes(needle) ||
            phone.numero.includes(needle),
    );

    return (
        <div
            data-testid="mesa-en-vivo"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'clamp(24px,4vw,56px)',
                padding: '34px 0 44px',
                borderBottom: '1px solid #d8d8d8',
                alignItems: 'start',
            }}
        >
            <div>
                <div style={EYEBROW}>
                    en vivo
                    {datos?.modo === 'ejemplo' && ' · datos de ejemplo'}
                </div>
                <h2 style={CARD_TITLE}>Sensores</h2>

                {unavailable && (
                    <p style={{ fontSize: '13.5px', color: '#555' }}>
                        Los datos no están disponibles por el momento.
                    </p>
                )}

                {!unavailable && datos === null && (
                    <p style={{ fontSize: '13.5px', color: '#555' }}>
                        Cargando…
                    </p>
                )}

                {!unavailable && datos !== null && (
                    <>
                        <div style={{ borderTop: '2px solid #000' }}>
                            {datos.sensores.map((sensor) => (
                                <div
                                    key={sensor.nombre}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto auto',
                                        alignItems: 'center',
                                        gap: '18px',
                                        padding: '14px 0',
                                        borderBottom: '1px solid #ececec',
                                    }}
                                >
                                    <b style={{ fontSize: '14px' }}>
                                        {sensor.nombre}
                                    </b>
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '13px',
                                        }}
                                    >
                                        {formatReading(sensor)}
                                    </span>
                                    <span
                                        style={{
                                            ...LEVEL_STYLE[sensor.nivel],
                                            padding: '4px 10px',
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {sensor.estado || 'sin estado'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p
                            style={{
                                margin: '12px 0 0',
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '10px',
                                letterSpacing: '0.04em',
                                color: datos.desactualizado ? RED : '#888',
                            }}
                        >
                            {datos.actualizado
                                ? 'Última actualización de la hoja: ' +
                                  formatUpdated(datos.actualizado)
                                : 'La hoja no informa su última actualización.'}
                            {datos.desactualizado &&
                                ' · Sin actualizar hace un rato: conviene revisar los sensores.'}
                        </p>
                    </>
                )}
            </div>

            <div>
                <div style={EYEBROW}>directorio</div>
                <h2 style={CARD_TITLE}>Teléfonos Eurotur</h2>

                {!unavailable && datos !== null && (
                    <>
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar por nombre o número…"
                            aria-label="Buscar en el directorio de teléfonos"
                            style={{
                                boxSizing: 'border-box',
                                width: '100%',
                                margin: '14px 0 12px',
                                padding: '9px 10px',
                                border: '1px solid #000',
                                borderRadius: 0,
                                fontFamily: "'Archivo', sans-serif",
                                fontSize: '13px',
                            }}
                        />
                        <div style={{ borderTop: '2px solid #000' }}>
                            {phones.map((phone, index) => (
                                <div
                                    key={phone.nombre + phone.numero + index}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto',
                                        gap: '18px',
                                        padding: '11px 0',
                                        borderBottom: '1px solid #ececec',
                                        fontSize: '14px',
                                    }}
                                >
                                    <span>{phone.nombre}</span>
                                    <a
                                        href={'tel:' + phone.numero}
                                        style={{
                                            color: '#000',
                                            textDecoration: 'none',
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontWeight: 700,
                                            fontSize: '13px',
                                        }}
                                    >
                                        {phone.numero}
                                    </a>
                                </div>
                            ))}
                            {phones.length === 0 && (
                                <p style={{ fontSize: '13.5px', color: '#555' }}>
                                    No hay teléfonos que coincidan con la
                                    búsqueda.
                                </p>
                            )}
                        </div>
                    </>
                )}

                {unavailable && (
                    <p style={{ fontSize: '13.5px', color: '#555' }}>
                        Los datos no están disponibles por el momento.
                    </p>
                )}
            </div>
        </div>
    );
}
