import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { formatPhone } from '@/lib/format-phone';

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

/** Color de la barra lateral y de la etiqueta de cada sensor según su estado. */
const LEVEL: Record<Sensor['nivel'], { bar: string; chip: CSSProperties }> = {
    ok: { bar: '#2e9d57', chip: { background: '#e7f5ec', color: '#14612f' } },
    alerta: { bar: RED, chip: { background: '#fde8ea', color: RED } },
    desconocido: { bar: '#bbb', chip: { background: '#eee', color: '#555' } },
};

const MONO: CSSProperties = { fontFamily: "'Space Mono', monospace" };

function formatDecimal(value: number): string {
    return value.toLocaleString('es-AR', { maximumFractionDigits: 1 });
}

function formatUpdated(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/** Tarjeta con barra negra de título, igual que "Accesos de red". */
function Card({
    title,
    badge,
    center,
    children,
}: {
    title: string;
    badge: string;
    center?: boolean;
    children: ReactNode;
}) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #000',
                background: '#fff',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#000',
                    color: '#fff',
                    padding: '12px 18px',
                }}
            >
                <span
                    style={{
                        fontFamily: "'Archivo', sans-serif",
                        fontWeight: 800,
                        fontSize: '16px',
                        letterSpacing: '-0.01em',
                    }}
                >
                    {title}
                </span>
                <span
                    style={{
                        ...MONO,
                        fontSize: '9px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#ff6a72',
                    }}
                >
                    <span className={badge === 'en vivo' ? 'mesa-pulso' : undefined}>
                        ●
                    </span>{' '}
                    {badge}
                </span>
            </div>
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: center ? 'center' : 'flex-start',
                }}
            >
                {children}
            </div>
        </div>
    );
}

function Message({ children }: { children: ReactNode }) {
    return (
        <p
            style={{
                margin: 0,
                padding: '22px 18px',
                fontSize: '13.5px',
                color: '#555',
            }}
        >
            {children}
        </p>
    );
}

function SensorTile({ sensor }: { sensor: Sensor }) {
    const level = LEVEL[sensor.nivel];

    return (
        <div
            style={{
                borderLeft: '4px solid ' + level.bar,
                background: '#fafafa',
                padding: '14px 16px',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    ...MONO,
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#666',
                }}
            >
                {sensor.nombre}
            </div>
            <div
                style={{
                    margin: '6px 0 2px',
                    fontFamily: "'Archivo', sans-serif",
                    fontWeight: 900,
                    fontSize: '34px',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                }}
            >
                {formatDecimal(sensor.temperatura)}
                <span style={{ fontSize: '16px', marginLeft: '3px' }}>°C</span>
            </div>
            <div style={{ fontSize: '13px', color: '#333' }}>
                Humedad <b>{formatDecimal(sensor.humedad)} %</b>
            </div>
            <span
                style={{
                    ...level.chip,
                    ...MONO,
                    display: 'inline-block',
                    marginTop: '10px',
                    padding: '4px 9px',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                }}
            >
                {sensor.estado || 'sin estado'}
            </span>
        </div>
    );
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
        failed || datos?.modo === 'error' || datos?.modo === 'no-configurado';
    const badge = datos?.modo === 'ejemplo' ? 'datos de ejemplo' : 'en vivo';
    const needle = query.trim().toLowerCase();
    const digits = needle.replace(/\D/g, '');
    const phones = (datos?.telefonos ?? []).filter(
        (phone) =>
            needle === '' ||
            phone.nombre.toLowerCase().includes(needle) ||
            (digits !== '' && phone.numero.replace(/\D/g, '').includes(digits)),
    );

    return (
        <div
            data-testid="mesa-en-vivo"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '24px',
                alignItems: 'stretch',
                marginBottom: '34px',
            }}
        >
            <Card title="Sensores · Tucumán" badge={badge} center>
                {unavailable && (
                    <Message>
                        Los datos no están disponibles por el momento.
                    </Message>
                )}
                {!unavailable && datos === null && <Message>Cargando…</Message>}
                {!unavailable && datos !== null && (
                    <>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '12px',
                                padding: '16px 18px',
                            }}
                        >
                            {datos.sensores.map((sensor) => (
                                <SensorTile
                                    key={sensor.nombre}
                                    sensor={sensor}
                                />
                            ))}
                        </div>
                        <div
                            style={{
                                ...MONO,
                                padding: '12px 18px',
                                borderTop: '1px solid #ececec',
                                fontSize: '10px',
                                letterSpacing: '0.04em',
                                color: datos.desactualizado ? RED : '#888',
                            }}
                        >
                            {datos.actualizado
                                ? 'Última actualización: ' +
                                  formatUpdated(datos.actualizado)
                                : 'La hoja no informa su última actualización.'}
                            {datos.desactualizado &&
                                ' · Sin actualizar hace un rato: conviene revisar los sensores.'}
                        </div>
                    </>
                )}
            </Card>

            <Card title="Teléfonos Eurotur" badge="directorio">
                {unavailable && (
                    <Message>
                        Los datos no están disponibles por el momento.
                    </Message>
                )}
                {!unavailable && datos === null && <Message>Cargando…</Message>}
                {!unavailable && datos !== null && (
                    <>
                        <div style={{ padding: '14px 18px' }}>
                            <input
                                type="search"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Buscar por nombre o número…"
                                aria-label="Buscar en el directorio de teléfonos"
                                style={{
                                    boxSizing: 'border-box',
                                    width: '100%',
                                    padding: '9px 10px',
                                    border: '1px solid #000',
                                    borderRadius: 0,
                                    fontFamily: "'Archivo', sans-serif",
                                    fontSize: '13px',
                                }}
                            />
                        </div>
                        <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                            {phones.map((phone, index) => (
                                <div
                                    key={phone.nombre + phone.numero + index}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: '18px',
                                        padding: '11px 18px',
                                        borderTop: '1px solid #ececec',
                                        fontSize: '14px',
                                    }}
                                >
                                    <span>{phone.nombre}</span>
                                    <a
                                        href={'tel:' + phone.numero}
                                        style={{
                                            ...MONO,
                                            color: '#000',
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                            fontSize: '13px',
                                        }}
                                    >
                                        {formatPhone(phone.numero)}
                                    </a>
                                </div>
                            ))}
                            {phones.length === 0 && (
                                <Message>
                                    No hay teléfonos que coincidan con la
                                    búsqueda.
                                </Message>
                            )}
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}
