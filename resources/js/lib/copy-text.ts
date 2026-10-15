/**
 * Copia un texto al portapapeles. `navigator.clipboard` solo existe en páginas seguras
 * (https o localhost) y el portal se abre por http en la red interna, así que si no
 * está disponible se usa el método antiguo (un campo oculto y `execCommand`).
 * Devuelve false si no se pudo copiar, para avisarle a la persona.
 */
export async function copyText(value: string): Promise<boolean> {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(value);

            return true;
        } catch {
            // Se sigue con el método antiguo.
        }
    }

    const field = document.createElement('textarea');

    field.value = value;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();

    let copied = false;

    try {
        copied = document.execCommand('copy');
    } catch {
        copied = false;
    }

    document.body.removeChild(field);

    return copied;
}
