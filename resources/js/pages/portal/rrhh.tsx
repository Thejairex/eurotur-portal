import { Head } from '@inertiajs/react';

const RED = '#E30613';

type RrhhLink = { t: string; h: string };
type RrhhGroup = { n: string; title: string; links: RrhhLink[] };

const RRHH_GROUPS: RrhhGroup[] = [
    {
        n: '01',
        title: 'Empleado',
        links: [
            {
                t: 'Formulario de altas de personal',
                h: 'https://drive.google.com/drive/u/0/folders/1qCarwAsJhCp3noSeNa9UJOZktMASLZAl',
            },
            {
                t: 'Carta vacaciones Eurotur',
                h: 'https://drive.google.com/drive/u/0/folders/1ESdsqm5G3rIaFKVWpRSXuvKel6hwAOpR',
            },
            {
                t: 'Carta vacaciones Travel Designers',
                h: 'https://drive.google.com/drive/u/0/folders/1ESdsqm5G3rIaFKVWpRSXuvKel6hwAOpR',
            },
            {
                t: 'Email, grupos y teléfonos',
                h: 'https://docs.google.com/spreadsheets/d/1o5Gsm8oSGapcLPGLmHGpmAZwyK9_49VFLQ_e6tqz_5o/edit',
            },
            {
                t: 'DDJJ de Domicilio Eurotur',
                h: 'https://drive.google.com/drive/u/1/folders/1rAVXN-F3tORsSqACPT3lWrZXr0eq906o',
            },
            {
                t: 'DDJJ de Domicilio Travel Designers',
                h: 'https://drive.google.com/drive/u/1/folders/1rAVXN-F3tORsSqACPT3lWrZXr0eq906o',
            },
        ],
    },
    {
        n: '02',
        title: 'Descripciones de puestos',
        links: [
            {
                t: 'Operaciones',
                h: 'https://drive.google.com/drive/u/0/folders/1pL7ZsiVWP4kl3rFThpNmblBgwcDbJ5t8',
            },
            {
                t: 'Administración',
                h: 'https://drive.google.com/drive/folders/195i-maUiLiBFPPuzb__9LMd77hjmZlDS',
            },
            {
                t: 'Contrataciones',
                h: 'https://drive.google.com/drive/folders/1ogdPFJRGxqAxPSFiVzSYOzNE4GFAeNCJ',
            },
        ],
    },
    {
        n: '03',
        title: 'Políticas de personal',
        links: [
            {
                t: 'Política de personal',
                h: 'https://drive.google.com/drive/u/0/folders/1egYGkgq1Yc5XPMZwLZc952K5Vi8hHdMi',
            },
            {
                t: 'Rendición de gastos de internet',
                h: 'https://docs.google.com/forms/d/e/1FAIpQLSdNjkgDveNTy3jp8dx1y43mrpgRH688NRSuoqve4Cha2143HQ/viewform',
            },
        ],
    },
    {
        n: '04',
        title: 'Feriados',
        links: [
            {
                t: 'Feriados nacionales 2026',
                h: 'https://www.argentina.gob.ar/jefatura/feriados-nacionales-2026',
            },
            {
                t: 'Actividad oficinas BUE-FTE-USH 2026',
                h: 'https://drive.google.com/drive/u/0/folders/1Ewpl-6o3RkYQh9rMSZE-Ern2SYQw6o6E',
            },
        ],
    },
    {
        n: '05',
        title: 'Cronogramas',
        links: [
            {
                t: 'Cronograma 24 y 31·12·25',
                h: 'https://drive.google.com/drive/u/0/folders/1-f5Ymcn9n_zTClSXgWxEMkFLP_wlv0GX',
            },
        ],
    },
    {
        n: '06',
        title: 'Organigrama',
        links: [
            {
                t: 'Organigrama Eurotur',
                h: 'https://drive.google.com/drive/u/0/folders/1YBH-WESU1sBqR1v6VjPDlpH0fwtTAfcV',
            },
        ],
    },
    {
        n: '07',
        title: 'Datos ART',
        links: [
            {
                t: 'Eurotur S.A.',
                h: 'https://drive.google.com/drive/folders/1M0bvz0j36Zvbc2bJrKK_XwlxJ-coJF0z',
            },
            {
                t: 'Travel Designers S.A.',
                h: 'https://drive.google.com/drive/folders/1M0bvz0j36Zvbc2bJrKK_XwlxJ-coJF0z',
            },
        ],
    },
    {
        n: '08',
        title: 'Liquidación de sueldo',
        links: [
            {
                t: 'Modelo de recibo (Excel)',
                h: 'https://docs.google.com/spreadsheets/d/1RLN0FVoN9zeE7CF7pCheeOdPcPNtZMjC/edit',
            },
            {
                t: 'Presentación',
                h: 'https://drive.google.com/drive/u/0/folders/1gkSTI2Lv-8Sa1YRQEMxG7ccQTfBNCrf3',
            },
            {
                t: 'Escalas CCT 547/08 · 08/2025',
                h: 'https://drive.google.com/drive/u/0/folders/18rxmKZW6Wo4IJn-waptDWnzWVsEbx1EO',
            },
            {
                t: 'Escalas CCT 547/08 · 12/2025',
                h: 'https://drive.google.com/drive/u/0/folders/18rxmKZW6Wo4IJn-waptDWnzWVsEbx1EO',
            },
            {
                t: 'Paritaria FAECYS-FAEVYT · 05/2026',
                h: 'https://drive.google.com/drive/u/0/folders/18rxmKZW6Wo4IJn-waptDWnzWVsEbx1EO',
            },
        ],
    },
];

export default function Rrhh() {
    return (
        <>
            <Head title="RRHH" />

            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '40px',
                        marginBottom: '38px',
                    }}
                >
                    <div style={{ maxWidth: '560px' }}>
                        <h1
                            style={{
                                fontFamily: "'Anton', sans-serif",
                                fontWeight: 400,
                                fontSize: 'clamp(44px,6vw,80px)',
                                lineHeight: 0.86,
                                margin: 0,
                                textTransform: 'lowercase',
                                letterSpacing: '-0.005em',
                            }}
                        >
                            recursos
                            <br />
                            humanos
                            <span style={{ color: RED }}>.</span>
                        </h1>
                        <p
                            style={{
                                maxWidth: '460px',
                                margin: '20px 0 0',
                                fontSize: '15px',
                                lineHeight: 1.5,
                                fontWeight: 500,
                                color: '#111',
                            }}
                        >
                            Altas de personal, vacaciones, políticas, feriados,
                            liquidación de sueldo y organigrama. Documentación
                            oficial de Eurotur S.A. y Travel Designers S.A.
                        </p>
                    </div>
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: 'clamp(96px,13vw,176px)',
                            lineHeight: 0.72,
                        }}
                    >
                        02
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
                    {RRHH_GROUPS.map((g) => (
                        <div
                            key={g.n}
                            style={{
                                borderTop: '3px solid #000',
                                borderRight: '1px dotted #000',
                                padding: '14px 18px 26px 0',
                                marginTop: '-3px',
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
                                    {g.n}
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
                                    gap: '7px',
                                }}
                            >
                                {g.links.map((l) => (
                                    <a
                                        key={l.h + l.t}
                                        href={l.h}
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
                                            borderBottom:
                                                '2px solid transparent',
                                            paddingBottom: '1px',
                                            alignSelf: 'flex-start',
                                            transition:
                                                'color .1s,border-color .1s',
                                        }}
                                    >
                                        {l.t}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '34px',
                        borderTop: '1px solid #000',
                        paddingTop: '14px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '14px',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '12px',
                            fontWeight: 700,
                        }}
                    >
                        <span style={{ color: RED }}>01</span>
                        <span style={{ color: '#ccc' }}>02</span>
                        <span style={{ color: '#ccc' }}>03</span>
                    </div>
                    <div
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#666',
                        }}
                    >
                        mantiene— Velázquez, Romina · actualizado 06·2026
                    </div>
                </div>
            </section>
        </>
    );
}

Rrhh.layout = { active: 'rrhh', label: 'rrhh—' };
