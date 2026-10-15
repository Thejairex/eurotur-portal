export type SectorUpdate = { en: string; por: string | null };

/** Fecha vieja que figuraba a mano al final del texto, por ejemplo " · actualizado 06·2026" o " · act. 07·2026". */
const OLD_DATE_SUFFIX = /\s*·\s*(?:actualizado|act\.)\s*\d{2}·\d{4}\s*$/i;

const FORMAT = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

/**
 * Línea "mantiene—" del pie de un sector. Si alguien modificó la página desde el portal,
 * muestra la fecha y hora reales de esa modificación (y quién la hizo) en lugar de la fecha
 * escrita a mano. Si nunca se modificó desde el portal, queda el texto de siempre.
 */
export function formatMaintLine(
    maint: string,
    update: SectorUpdate | undefined,
): string {
    if (!update) {
        return maint;
    }

    const parts = FORMAT.formatToParts(new Date(update.en));
    const get = (type: string) =>
        parts.find((part) => part.type === type)?.value ?? '';
    const date = `${get('day')}·${get('month')}·${get('year')} ${get('hour')}:${get('minute')}`;
    const by = update.por ? ` por ${update.por}` : '';

    return `${maint.replace(OLD_DATE_SUFFIX, '')} · actualizado ${date}${by}`;
}
