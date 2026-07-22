const RED = '#E30613';
const LINK_UNDERLINE = '1px solid #c4c4c4';

export type SectorItem = { t: string; h?: string };
export type SectorGroup = { title: string; items: SectorItem[] };

export type SectorIndexData = {
    kicker: string;
    title: string;
    num: string;
    intro: string;
    maint: string;
    groups: SectorGroup[];
};

export function SectorIndex({ data }: { data: SectorIndexData }) {
    return (
        <section>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '40px',
                    marginBottom: '30px',
                }}
            >
                <div style={{ maxWidth: '620px' }}>
                    <div
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: '#666',
                            marginBottom: '12px',
                        }}
                    >
                        {data.kicker}
                    </div>
                    <h1
                        style={{
                            fontFamily: "'Anton', sans-serif",
                            fontWeight: 400,
                            fontSize: 'clamp(64px,9vw,132px)',
                            lineHeight: 0.86,
                            margin: 0,
                            letterSpacing: '-0.005em',
                        }}
                    >
                        {data.title}
                        <span style={{ color: RED }}>.</span>
                    </h1>
                    <p
                        style={{
                            maxWidth: '480px',
                            margin: '18px 0 0',
                            fontSize: '15px',
                            lineHeight: 1.5,
                            fontWeight: 500,
                            color: '#111',
                        }}
                    >
                        {data.intro}
                    </p>
                </div>
                <div
                    style={{
                        fontFamily: "'Archivo', sans-serif",
                        fontWeight: 900,
                        fontSize: 'clamp(80px,10vw,140px)',
                        lineHeight: 0.72,
                    }}
                >
                    {data.num}
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4,1fr)',
                    gap: 0,
                    borderTop: '3px solid #000',
                }}
            >
                {data.groups.map((g, i) => (
                    <div
                        key={g.title}
                        style={{
                            borderTop: '3px solid #000',
                            borderRight: '1px dotted #000',
                            padding: `14px 18px 26px ${i % 4 === 0 ? '0' : '18px'}`,
                            marginTop: '-3px',
                            minHeight: '120px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '10px',
                                marginBottom: '12px',
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Space Mono', monospace",
                                    fontWeight: 700,
                                    fontSize: '11px',
                                }}
                            >
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <span
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 800,
                                    fontSize: '16px',
                                    letterSpacing: '-0.01em',
                                    lineHeight: 1.05,
                                }}
                            >
                                {g.title}
                            </span>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '9px',
                            }}
                        >
                            {g.items.map((item) =>
                                item.h ? (
                                    <a
                                        key={item.h + item.t}
                                        href={item.h}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="doc-link"
                                        style={{
                                            textDecoration: 'none',
                                            color: '#000',
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 500,
                                            fontSize: '13px',
                                            lineHeight: 1.25,
                                            borderBottom: LINK_UNDERLINE,
                                            paddingBottom: '2px',
                                            alignSelf: 'flex-start',
                                            display: 'inline-flex',
                                            alignItems: 'baseline',
                                            gap: '5px',
                                            transition:
                                                'color .1s,border-color .1s,transform .1s',
                                        }}
                                    >
                                        {item.t}
                                        <span
                                            style={{
                                                fontFamily:
                                                    "'Space Mono', monospace",
                                                fontSize: '10px',
                                                color: RED,
                                            }}
                                        >
                                            ↗
                                        </span>
                                    </a>
                                ) : (
                                    <div
                                        key={item.t}
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 500,
                                            fontSize: '12.5px',
                                            lineHeight: 1.4,
                                            color: '#777',
                                        }}
                                    >
                                        {item.t}
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    marginTop: '34px',
                    borderTop: '1px solid #000',
                    paddingTop: '14px',
                }}
            >
                <div
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#666',
                    }}
                >
                    mantiene— {data.maint}
                </div>
            </div>
        </section>
    );
}
