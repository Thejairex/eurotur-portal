import { Head, router, useForm } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { initialsOf } from '@/components/backoffice/backoffice-header';
import {
    ACCEPTED_IMAGE_TYPES,
    MAX_ORIGINAL_BYTES,
    resizeToWebp,
} from '@/lib/resize-image';

type Perfil = {
    id: number;
    name: string;
    email: string;
    puesto: string | null;
    area: string | null;
    sede: string | null;
    interno: string | null;
    foto: string | null;
};

/**
 * Mi perfil. Cada persona sube su foto y cambia su interno; el mail es el de su usuario. Puesto,
 * área y sede los cambia RRHH (o quien administra usuarios), que también puede abrir el perfil
 * de otra persona desde Usuarios.
 */
export default function PerfilPage({
    perfil,
    esPropio,
    puedeEditarPuesto,
}: {
    perfil: Perfil;
    esPropio: boolean;
    puedeEditarPuesto: boolean;
}) {
    const base = esPropio
        ? '/administracion/perfil'
        : `/administracion/usuarios/${perfil.id}/perfil`;
    const form = useForm({
        puesto: perfil.puesto ?? '',
        area: perfil.area ?? '',
        sede: perfil.sede ?? '',
        interno: perfil.interno ?? '',
    });
    const fileInput = useRef<HTMLInputElement>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const save = (event: FormEvent) => {
        event.preventDefault();
        form.put(base, { preserveScroll: true });
    };

    const pickPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        event.target.value = '';

        if (!file) {
            return;
        }

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            setPhotoError('La foto tiene que ser JPG, PNG o WebP.');

            return;
        }

        if (file.size > MAX_ORIGINAL_BYTES) {
            setPhotoError('La foto pesa más de 2 MB.');

            return;
        }

        setPhotoError(null);
        setUploading(true);

        try {
            const resized = await resizeToWebp(file);

            router.post(
                `${base}/foto`,
                { foto: resized },
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onError: (errors) =>
                        setPhotoError(errors.foto ?? 'No se pudo subir la foto.'),
                    onFinish: () => setUploading(false),
                },
            );
        } catch {
            setPhotoError('No se pudo preparar la foto.');
            setUploading(false);
        }
    };

    const removePhoto = () =>
        router.delete(`${base}/foto`, { preserveScroll: true });

    return (
        <>
            <Head title="Mi perfil" />

            <div className="bo-ctx">Back Office</div>
            <h1 className="bo-title">
                {esPropio ? 'Mi perfil' : perfil.name}
                <i>.</i>
            </h1>

            <div className="bo-prof" style={{ marginTop: 24 }}>
                <div style={{ textAlign: 'center' }}>
                    <div
                        className="bo-avatar-lg"
                        style={
                            perfil.foto
                                ? { backgroundImage: `url(${perfil.foto})` }
                                : undefined
                        }
                    >
                        {perfil.foto ? '' : initialsOf(perfil.name)}
                    </div>
                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        onChange={pickPhoto}
                    />
                    <div style={{ marginTop: 12 }}>
                        <button
                            type="button"
                            className="bo-btn bo-btn-ghost"
                            disabled={uploading}
                            onClick={() => fileInput.current?.click()}
                        >
                            <Camera size={16} aria-hidden="true" />
                            {uploading ? 'Subiendo…' : 'Subir foto'}
                        </button>
                    </div>
                    {perfil.foto && (
                        <button
                            type="button"
                            className="bo-link-text"
                            onClick={removePhoto}
                        >
                            Quitar foto
                        </button>
                    )}
                    {photoError && <div className="bo-error">{photoError}</div>}
                    <div className="bo-note" style={{ marginTop: 8 }}>
                        JPG, PNG o WebP, hasta 2 MB
                    </div>
                </div>

                <form onSubmit={save} style={{ flex: 1, maxWidth: 560 }}>
                    <div className="bo-field">
                        <label>Nombre</label>
                        <input className="bo-input" value={perfil.name} readOnly />
                    </div>
                    <div className="bo-field">
                        <label>Mail</label>
                        <input className="bo-input" value={perfil.email} readOnly />
                    </div>
                    {(['puesto', 'area', 'sede'] as const).map((field) => (
                        <div className="bo-field" key={field}>
                            <label htmlFor={field}>
                                {field === 'puesto'
                                    ? 'Puesto'
                                    : field === 'area'
                                      ? 'Área'
                                      : 'Sede'}
                            </label>
                            <div>
                                <input
                                    id={field}
                                    className="bo-input"
                                    value={form.data[field]}
                                    readOnly={!puedeEditarPuesto}
                                    onChange={(event) =>
                                        form.setData(field, event.target.value)
                                    }
                                />
                                {form.errors[field] && (
                                    <div className="bo-error">
                                        {form.errors[field]}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="bo-field">
                        <label htmlFor="interno">Interno</label>
                        <div>
                            <input
                                id="interno"
                                className="bo-input"
                                value={form.data.interno}
                                onChange={(event) =>
                                    form.setData('interno', event.target.value)
                                }
                            />
                            {form.errors.interno && (
                                <div className="bo-error">
                                    {form.errors.interno}
                                </div>
                            )}
                        </div>
                    </div>
                    {!puedeEditarPuesto && (
                        <div className="bo-note">
                            Puesto, área y sede los actualiza RRHH.
                        </div>
                    )}
                    <div style={{ marginTop: 16 }}>
                        <button
                            type="submit"
                            className="bo-btn"
                            disabled={form.processing}
                        >
                            Guardar cambios
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
