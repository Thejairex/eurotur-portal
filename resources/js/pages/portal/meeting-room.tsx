import { Head } from '@inertiajs/react';
import { MaintLine } from '@/components/portal/maint-line';

const RED = '#E3000F';

type Props = {
    calendarUrl: string | null;
    instructivoUrl: string | null;
};

export default function MeetingRoom({ calendarUrl, instructivoUrl }: Props) {
    const calendarId = calendarUrl?.match(/src=([^&]+)/)?.[1] ?? null;
    const addCalendarUrl = calendarId
        ? `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(calendarId)}`
        : null;

    return (
        <>
            <Head title="Sala de Reuniones" />

            <section
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
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
                                fontFamily:
                                    "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                fontSize: '10px',
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                color: 'var(--p-mut)',
                                marginBottom: '12px',
                            }}
                        >
                            reserva de sala · google calendar
                        </div>
                        <h1
                            style={{
                                fontFamily:
                                    "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                fontWeight: 800,
                                fontSize: 'clamp(32px,3.2vw,44px)',
                                lineHeight: 0.95,
                                margin: 0,
                                letterSpacing: '-1px',
                            }}
                        >
                            Sala de Reuniones
                            <span style={{ color: RED }}>.</span>
                        </h1>
                        <p
                            style={{
                                maxWidth: '480px',
                                margin: '18px 0 0',
                                fontSize: '15px',
                                lineHeight: 1.5,
                                fontWeight: 500,
                                color: 'var(--p-ink)',
                            }}
                        >
                            Agendá la "Sala de Reuniones 1" directo en el
                            calendario. Mirá el instructivo antes de usarla por
                            primera vez.
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '14px',
                        marginBottom: '18px',
                    }}
                >
                    {instructivoUrl && (
                        <a
                            href={instructivoUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                fontFamily:
                                    "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                background: '#000',
                                color: '#fff',
                                textDecoration: 'none',
                                border: '1px solid #000',
                                padding: '11px 16px',
                                transition: 'background .12s, color .12s',
                            }}
                        >
                            Instructivo ↗
                        </a>
                    )}
                    {addCalendarUrl && (
                        <a
                            href={addCalendarUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                fontFamily:
                                    "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                background: RED,
                                color: '#fff',
                                textDecoration: 'none',
                                border: `1px solid ${RED}`,
                                padding: '11px 16px',
                                transition: 'opacity .12s',
                            }}
                        >
                            + Añadir a Google Calendar
                        </a>
                    )}
                </div>

                {calendarUrl ? (
                    <div
                        style={{
                            border: '3px solid #000',
                            position: 'relative',
                            background: 'var(--p-card)',
                        }}
                    >
                        <iframe
                            src={calendarUrl}
                            title="Sala de Reuniones 1"
                            style={{
                                display: 'block',
                                width: '100%',
                                height: '640px',
                                border: 'none',
                            }}
                            sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-popups-to-escape-sandbox allow-downloads allow-modals allow-storage-access-by-user-activation"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div
                        style={{
                            border: '3px solid #000',
                            padding: '40px',
                            fontFamily:
                                "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                            fontSize: '11px',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--p-mut)',
                        }}
                    >
                        calendario no configurado — avisá a IT
                    </div>
                )}

                <MaintLine>
                    IT · Mesa de Información · actualizado 08·2026
                </MaintLine>
            </section>
        </>
    );
}

MeetingRoom.layout = { active: 'meeting-room', label: 'Sala de Reuniones—' };
