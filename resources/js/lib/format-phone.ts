/**
 * Da formato argentino a un teléfono guardado solo con dígitos:
 * 1155666250 → "11 5566 6250", 43126077 → "4312 6077", 2966659165 → "2966 65 9165".
 * Lo que no encaja en esas formas (por ejemplo un número del exterior) queda como está.
 */
export function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');

    if (digits.length === 10 && digits.startsWith('11')) {
        return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
    }

    if (digits.length === 10) {
        return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
    }

    if (digits.length === 8) {
        return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }

    return raw.trim();
}
