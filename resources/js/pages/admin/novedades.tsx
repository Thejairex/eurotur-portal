import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type Novedad = {
    id: number;
    fecha: string;
    titulo: string;
    texto: string;
    nueva: boolean;
};

/** "2026-10-22" → "22·10·2026" (la fecha llega como texto, sin zona horaria). */
function formatDate(iso: string): string {
    const [year, month, day] = iso.split('-');

    return `${day}·${month}·${year}`;
}

/**
 * Novedades del sistema: la lista que lee todo el mundo y, para quien tiene el permiso, el
 * formulario para publicarlas, editarlas y borrarlas.
 */
export default function NovedadesPage({
    novedades,
    puedeAdministrar,
}: {
    novedades: Novedad[];
    puedeAdministrar: boolean;
}) {
    const today = new Date().toISOString().slice(0, 10);
    const form = useForm({ fecha: today, titulo: '', texto: '' });
    const [editing, setEditing] = useState<Novedad | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);

    const startEdit = (novedad: Novedad) => {
        setEditing(novedad);
        form.setData({
            fecha: novedad.fecha,
            titulo: novedad.titulo,
            texto: novedad.texto,
        });
    };

    const reset = () => {
        setEditing(null);
        form.setData({ fecha: today, titulo: '', texto: '' });
        form.clearErrors();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = { preserveScroll: true, onSuccess: reset };

        if (editing) {
            form.put(`/administracion/novedades/${editing.id}`, options);
        } else {
            form.post('/administracion/novedades', options);
        }
    };

    const remove = (id: number) =>
        router.delete(`/administracion/novedades/${id}`, {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });

    return (
        <>
            <Head title="Novedades" />

            <div className="bo-ctx">Back Office</div>
            <h1 className="bo-title">
                Novedades<i>.</i>
            </h1>

            {puedeAdministrar && (
                <form
                    onSubmit={submit}
                    className="bo-card"
                    style={{ margin: '20px 0', background: 'var(--bo-soft)' }}
                >
                    <h2>
                        {editing ? 'Editar novedad' : 'Publicar una novedad'}
                    </h2>
                    <div className="bo-field">
                        <label htmlFor="fecha">Fecha</label>
                        <div>
                            <input
                                id="fecha"
                                type="date"
                                className="bo-input"
                                value={form.data.fecha}
                                onChange={(event) =>
                                    form.setData('fecha', event.target.value)
                                }
                            />
                            {form.errors.fecha && (
                                <div className="bo-error">
                                    {form.errors.fecha}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bo-field">
                        <label htmlFor="titulo">Título</label>
                        <div>
                            <input
                                id="titulo"
                                className="bo-input"
                                maxLength={160}
                                value={form.data.titulo}
                                onChange={(event) =>
                                    form.setData('titulo', event.target.value)
                                }
                            />
                            {form.errors.titulo && (
                                <div className="bo-error">
                                    {form.errors.titulo}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bo-field">
                        <label htmlFor="texto">Texto</label>
                        <div>
                            <textarea
                                id="texto"
                                className="bo-input"
                                rows={3}
                                maxLength={1000}
                                value={form.data.texto}
                                onChange={(event) =>
                                    form.setData('texto', event.target.value)
                                }
                            />
                            {form.errors.texto && (
                                <div className="bo-error">
                                    {form.errors.texto}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button
                            type="submit"
                            className="bo-btn"
                            disabled={form.processing}
                        >
                            {editing ? 'Guardar cambios' : 'Publicar'}
                        </button>
                        {editing && (
                            <button
                                type="button"
                                className="bo-btn bo-btn-ghost"
                                onClick={reset}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            )}

            <div className="bo-card" style={{ marginTop: 16 }}>
                {novedades.length === 0 && (
                    <div className="bo-empty">Todavía no hay novedades.</div>
                )}
                {novedades.map((novedad) => (
                    <div key={novedad.id} className="bo-item">
                        <div className="bo-item-date">
                            {formatDate(novedad.fecha)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <b>
                                {novedad.titulo}{' '}
                                {novedad.nueva && (
                                    <span className="bo-tag">NUEVA</span>
                                )}
                            </b>
                            <p className="bo-item-text">{novedad.texto}</p>
                        </div>
                        {puedeAdministrar && (
                            <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                    type="button"
                                    className="bo-icon-btn"
                                    title="Editar"
                                    aria-label="Editar"
                                    onClick={() => startEdit(novedad)}
                                >
                                    <Pencil size={15} aria-hidden="true" />
                                </button>
                                {deleting === novedad.id ? (
                                    <>
                                        <button
                                            type="button"
                                            className="bo-btn"
                                            onClick={() => remove(novedad.id)}
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
                                        onClick={() => setDeleting(novedad.id)}
                                    >
                                        <Trash2 size={15} aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}
