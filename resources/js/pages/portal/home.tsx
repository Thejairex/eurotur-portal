import { Head, Link, usePage } from '@inertiajs/react';
import { SECTORS } from '@/lib/portal-sectors';
import { exchangeRate, mesa } from '@/routes/portal';

const RED = '#E3000F';

type QuickAccess = {
    title: string;
    href: string;
    internal?: boolean;
};

const QUICK_ACCESS: QuickAccess[] = [
    {
        title: 'Ticketera',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSeyq0O-jjq9FRdLqdL8NeOuDogy0VrRfvspfBXU7-3_AO64rA/viewform',
    },
    {
        title: 'Internos',
        href: 'https://docs.google.com/spreadsheets/d/1o5Gsm8oSGapcLPGLmHGpmAZwyK9_49VFLQ_e6tqz_5o/edit',
    },
    {
        title: 'Guía telefónica',
        href: 'https://www.appsheet.com/start/9e512a05-852d-4911-aefd-45976c715d0e',
    },
    {
        title: 'Tipo de Cambio',
        href: exchangeRate().url,
        internal: true,
    },
    {
        title: 'Mesa de Información',
        href: mesa().url,
        internal: true,
    },
];

function SectionHeading({ label }: { label: string }) {
    return (
        <h2
            style={{
                fontSize: '13px',
                letterSpacing: '0.14em',
                color: 'var(--p-mut)',
                fontWeight: 700,
                margin: '26px 0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textTransform: 'uppercase',
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    width: '4px',
                    height: '14px',
                    borderRadius: '2px',
                    background: RED,
                    flex: '0 0 auto',
                }}
            />
            {label}
            <span
                aria-hidden="true"
                style={{ flex: 1, height: '1px', background: 'var(--p-line)' }}
            />
        </h2>
    );
}

export default function Home() {
    const { canEdit } = usePage().props as unknown as {
        canEdit: boolean;
    };

    const visibleSectors = SECTORS.filter(
        (sector) =>
            (sector.id !== 'search-admin' || canEdit) &&
            sector.id !== 'exchange-rate',
    );

    return (
        <>
            <Head title="Portal Eurotur" />

            <section data-testid="home-root">
                <div style={{ margin: '6px 0 26px' }}>
                    <div
                        style={{
                            fontSize: '12px',
                            letterSpacing: '0.12em',
                            color: 'var(--p-mut)',
                            textTransform: 'uppercase',
                        }}
                    >
                        intranet corporativa — hub de accesos
                    </div>
                    <h1
                        data-testid="home-hero"
                        style={{
                            fontSize: 'clamp(32px,3.2vw,44px)',
                            fontWeight: 800,
                            margin: '6px 0',
                            letterSpacing: '-1.5px',
                            lineHeight: 1.05,
                        }}
                    >
                        Portal de Eurotur
                        <span style={{ color: RED }}>.</span>
                    </h1>
                </div>

                <SectionHeading label="Accesos rápidos" />
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(170px, 1fr))',
                        gap: '14px',
                    }}
                >
                    {QUICK_ACCESS.map((q, index) => {
                        const cardStyle: React.CSSProperties = {
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '16px 18px',
                            textDecoration: 'none',
                            color: 'var(--p-ink)',
                            cursor: 'pointer',
                        };
                        const content = (
                            <>
                                <small
                                    style={{
                                        display: 'block',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        color: RED,
                                        marginBottom: '4px',
                                    }}
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </small>
                                <span
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: '8px',
                                    }}
                                >
                                    {q.title}
                                    <span
                                        className="q-arrow"
                                        aria-hidden="true"
                                        style={{ color: 'var(--p-mut)' }}
                                    >
                                        {q.internal ? '→' : '↗'}
                                    </span>
                                </span>
                            </>
                        );

                        return q.internal ? (
                            <Link
                                key={q.title}
                                href={q.href}
                                className="quick-card"
                                style={cardStyle}
                            >
                                {content}
                            </Link>
                        ) : (
                            <a
                                key={q.title}
                                href={q.href}
                                target="_blank"
                                rel="noreferrer"
                                className="quick-card"
                                style={cardStyle}
                            >
                                {content}
                            </a>
                        );
                    })}
                </div>

                <SectionHeading label="Sectores" />
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fill, minmax(210px, 1fr))',
                        gap: '14px',
                    }}
                >
                    {visibleSectors.map((sector) => (
                        <Link
                            key={sector.id}
                            href={sector.href}
                            className="tile"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                minHeight: '150px',
                                padding: '18px',
                                textDecoration: 'none',
                                color: '#fff',
                            }}
                        >
                            <img
                                className="tile-photo"
                                src={
                                    sector.photo ??
                                    `/img/portal/sectores/${sector.id}.webp`
                                }
                                alt=""
                                loading="lazy"
                                decoding="async"
                            />
                            <span className="tile-shade" aria-hidden="true" />
                            <span
                                className="tile-title"
                                style={{
                                    fontSize: '15.5px',
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end',
                                    gap: '8px',
                                }}
                            >
                                {sector.shortLabel}
                                <span className="tile-arrow" aria-hidden="true">
                                    →
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </>
    );
}

Home.layout = { active: 'home', label: 'Inicio—' };
