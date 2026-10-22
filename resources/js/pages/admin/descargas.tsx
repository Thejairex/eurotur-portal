import { Head, router, useForm } from '@inertiajs/react';
import { Download, Pencil, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

type Archivo = {
    id: number;
    nombre: string;
    extension: string;
    tamano: number;
};

const ALLOWED = '.pdf,.xlsx,.docx,.zip,.png,.jpg,.jpeg';

/** Tamaño legible: "850 KB", "1,2 MB". */
export function formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toLocaleString('es-AR', { maximumFractionDigits: 1 })} MB`;
}

/**
 * Archivos para descargar. Todas las personas del Back Office los bajan; quien tiene el permiso
 * los sube, los renombra y los borra.
 */
export default function DescargasPage({
    archivos,
    puedeAdministrar,
}: {
    archivos: Archivo[];
    puedeAdministrar: boolean;
}) {
    const fileInput = useRef<HTMLInputElement>(null);
    const form = useForm<{ archivo: File | null; nombre: string }>({
        archivo: null,
        nombre: '',
    });
    const [renaming, setRenaming] = useState<Archivo | null>(null);
    const [newName, setNewName] = useState('');
    const [deleting, setDeleting] = useState<number | null>(null);

    const upload = (event: FormEvent) => {
        event.preventDefault();
        form.post('/administracion/descargas', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();

                if (fileInput.current) {
                    fileInput.current.value = '';
                }
            },
        });
    };

    const rename = (event: FormEvent) => {
        event.preventDefault();

        if (!renaming) {
            return;
        }

        router.put(
            `/administracion/descargas/${renaming.id}`,
            { nombre: newName },
            { preserveScroll: true, onSuccess: () => setRenaming(null) },
        );
    };

    const remove = (id: number) =>
        router.delete(`/administracion/descargas/${id}`, {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });

    return (
        <>
            <Head title="Descargas" />

            <div className="bo-ctx">Back Office</div>
            <h1 className="bo-title">
                Descargas<i>.</i>
            </h1>

            {puedeAdministrar && (
                <form
                    onSubmit={upload}
                    className="bo-card"
                    style={{ margin: '20px 0', background: 'var(--bo-soft)' }}
                >
                    <h2>Subir un archivo</h2>
                    <div className="bo-field">
                        <label htmlFor="archivo">Archivo</label>
                        <div>
                            <input
                                ref={fileInput}
                                id="archivo"
                                type="file"
                                accept={ALLOWED}
                                onChange={(event) =>
                                    form.setData(
                                        'archivo',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            {form.errors.archivo && (
                                <div className="bo-error">
                                    {form.errors.archivo}
                                </div>
                            )}
                            <div className="bo-note">
                                PDF, XLSX, DOCX, ZIP, PNG o JPG, hasta 20 MB
                            </div>
                        </div>
                    </div>
                    <div className="bo-field">
                        <label htmlFor="nombre">Nombre</label>
                        <input
                            id="nombre"
                            className="bo-input"
                            maxLength={160}
                            placeholder="Si lo dejás vacío se usa el del archivo"
                            value={form.data.nombre}
                            onChange={(event) =>
                                form.setData('nombre', event.target.value)
                            }
                        />
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <button
                            type="submit"
                            className="bo-btn"
                            disabled={form.processing || !form.data.archivo}
                        >
                            {form.processing ? 'Subiendo…' : 'Subir'}
                        </button>
                    </div>
                </form>
            )}

            <div className="bo-card" style={{ marginTop: 16 }}>
                {archivos.length === 0 && (
                    <div className="bo-empty">
                        Todavía no hay archivos para descargar.
                    </div>
                )}
                {archivos.map((archivo) => (
                    <div key={archivo.id} className="bo-item">
                        <a
                            href={`/administracion/descargas/${archivo.id}/archivo`}
                            className="bo-row"
                            style={{ flex: 1 }}
                        >
                            <span className="bo-row-ico">
                                <Download size={18} aria-hidden="true" />
                            </span>
                            <span>
                                {renaming?.id === archivo.id ? (
                                    <span />
                                ) : (
                                    <b>{archivo.nombre}</b>
                                )}
                                <small>
                                    {archivo.extension.toUpperCase()} ·{' '}
                                    {formatSize(archivo.tamano)}
                                </small>
                            </span>
                        </a>
                        {puedeAdministrar && (
                            <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                    type="button"
                                    className="bo-icon-btn"
                                    title="Renombrar"
                                    aria-label="Renombrar"
                                    onClick={() => {
                                        setRenaming(archivo);
                                        setNewName(archivo.nombre);
                                    }}
                                >
                                    <Pencil size={15} aria-hidden="true" />
                                </button>
                                {deleting === archivo.id ? (
                                    <>
                                        <button
                                            type="button"
                                            className="bo-btn"
                                            onClick={() => remove(archivo.id)}
                                        >
                                            Sí, borrar
                                        </button>
                                        <button
                                            type="button"
                                            className="bo-btn bo-btn-ghost"
                                            onClick={() => setDeleting(null)}
                                        >
                                            No
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        className="bo-icon-btn"
                                        title="Borrar"
                                        aria-label="Borrar"
                                        onClick={() => setDeleting(archivo.id)}
                                    >
                                        <Trash2 size={15} aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {renaming && (
                <form
                    onSubmit={rename}
                    className="bo-card"
                    style={{ marginTop: 16 }}
                >
                    <h2>Renombrar «{renaming.nombre}»</h2>
                    <input
                        className="bo-input"
                        maxLength={160}
                        value={newName}
                        onChange={(event) => setNewName(event.target.value)}
                        aria-label="Nuevo nombre"
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button type="submit" className="bo-btn">
                            Guardar
                        </button>
                        <button
                            type="button"
                            className="bo-btn bo-btn-ghost"
                            onClick={() => setRenaming(null)}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
        </>
    );
}
