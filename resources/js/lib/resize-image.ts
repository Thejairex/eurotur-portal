const SIZE = 400;

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_ORIGINAL_BYTES = 2 * 1024 * 1024;

/**
 * Recorta la imagen al centro, la lleva a 400 × 400 px y la convierte a webp. Se hace en el
 * navegador antes de subirla; el servidor la vuelve a verificar de todas formas.
 */
export async function resizeToWebp(file: File): Promise<File> {
    const bitmap = await createImageBitmap(file);
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = SIZE;
    canvas.height = SIZE;

    if (!context) {
        throw new Error('No se pudo preparar la imagen.');
    }

    context.drawImage(
        bitmap,
        (bitmap.width - side) / 2,
        (bitmap.height - side) / 2,
        side,
        side,
        0,
        0,
        SIZE,
        SIZE,
    );
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/webp', 0.85),
    );

    if (!blob) {
        throw new Error('No se pudo convertir la imagen.');
    }

    return new File([blob], 'foto.webp', { type: 'image/webp' });
}
