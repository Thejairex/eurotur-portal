import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { formatPhone } from '@/lib/format-phone';

const RED = '#E3000F';
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
    minutosSinActualizar: number | null;
};

/** Color de la barra lateral y de la etiqueta de cada sensor según su estado. */
const LEVEL: Record<Sensor['nivel'], { bar: string; chip: CSSProperties }> = {
    ok: { bar: '#2e9d57', chip: { background: 'var(--p-ok-bg)', color: 'var(--p-ok-tx)' } },
    alerta: { bar: RED, chip: { background: 'var(--p-bad-bg)', color: RED } },
    desconocido: { bar: '#bbb', chip: { background: 'var(--p-soft)', color: 'var(--p-ink)' } },
};

const MONO: CSSProperties = {
    fontFamily: "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
};

function formatDecimal(value: number): string {
    return value.toLocaleString('es-AR', { maximumFractionDigits: 1 });
}

function formatAge(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        const rest = minutes % 60;

        return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
    }

    const days = Math.floor(hours / 24);

    return days === 1 ? '1 día' : `${days} días`;
}

function staleMessage(minutes: number | null): string {
    return minutes === null
        ? 'Los sensores no informan su última lectura.'
        : `Los sensores no informan desde hace ${formatAge(minutes)}.`;
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
                background: 'var(--p-card)',
                borderRadius: '16px',
                boxShadow: '0 1px 2px rgba(0,0,0,.05)',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--p-line)',
                    color: 'var(--p-ink)',
                    padding: '14px 18px',
                }}
            >
                <span
                    style={{
                        fontFamily:
                            "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
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
                        color: '#E3000F',
                        border: '1px solid #E3000F',
                        borderRadius: '999px',
                        padding: '2px 10px',
                    }}
                >
                    <span
                        className={
                            badge === 'en vivo' ? 'mesa-pulso' : undefined
                        }
                    >
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
                color: 'var(--p-ink)',
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
                borderTop: '3px solid ' + level.bar,
                borderRadius: '12px',
                background: 'var(--p-soft)',
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
                    color: 'var(--p-mut)',
                }}
            >
                {sensor.nombre}
            </div>
            <div
                style={{
                    margin: '6px 0 2px',
                    fontFamily:
                        "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                    fontWeight: 900,
                    fontSize: '34px',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                }}
            >
                {formatDecimal(sensor.temperatura)}
                <span style={{ fontSize: '16px', marginLeft: '3px' }}>°C</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--p-ink)' }}>
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
                                borderTop: '1px solid var(--p-line)',
                                fontSize: '10px',
                                letterSpacing: '0.04em',
                                color: datos.desactualizado ? RED : '#888',
                            }}
                        >
                            {datos.actualizado
                                ? 'Última actualización: ' +
                                  formatUpdated(datos.actualizado)
                                : 'La hoja no informa su última actualización.'}
                        </div>
                        {datos.desactualizado && (
                            <div
                                style={{
                                    padding: '12px 18px',
                                    background: 'var(--p-warn-bg)',
                                    borderTop: '1px solid var(--p-line)',
                                    fontSize: '14px',
                                    lineHeight: 1.45,
                                }}
                            >
                                ⚠️ {staleMessage(datos.minutosSinActualizar)}{' '}
                                Avisá al equipo de Sistemas:{' '}
                                <Link
                                    href="/it"
                                    style={{ color: 'var(--p-ink)', fontWeight: 700 }}
                                >
                                    ir a la página de IT
                                </Link>
                            </div>
                        )}
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
                                    border: '1px solid var(--p-line)',
                                    borderRadius: '999px',
                                    fontFamily:
                                        "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
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
                                        borderTop: '1px solid var(--p-line)',
                                        fontSize: '14px',
                                    }}
                                >
                                    <span>{phone.nombre}</span>
                                    <a
                                        href={'tel:' + phone.numero}
                                        style={{
                                            ...MONO,
                                            color: 'var(--p-ink)',
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
