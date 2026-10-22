import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { searchResults } from '@/routes/portal';

/** Iniciales para el círculo del usuario ("Valentina Homez" → "VH"). */
export function initialsOf(name: string): string {
    return name
        .split(/\s+/)
        .filter((part) => part !== '')
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

/** Franja superior: buscador del portal y la persona que tiene la sesión abierta. */
export function BackofficeHeader() {
    const { auth } = usePage().props;
    const [query, setQuery] = useState('');

    const search = (event: FormEvent) => {
        event.preventDefault();

        const trimmed = query.trim();

        if (trimmed.length >= 2) {
            router.visit(searchResults.url({ query: { q: trimmed } }));
        }
    };

    return (
        <div className="bo-top">
            <form onSubmit={search} role="search" style={{ flex: 1 }}>
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar en el portal"
                    aria-label="Buscar en el portal"
                    className="bo-search"
                />
            </form>
            {auth?.user && (
                <div className="bo-pill">
                    <span
                        className="bo-av"
                        aria-hidden="true"
                        style={
                            auth.user.foto_path
                                ? {
                                      backgroundImage: `url(/storage/${auth.user.foto_path})`,
                                  }
                                : undefined
                        }
                    >
                        {auth.user.foto_path ? '' : initialsOf(auth.user.name)}
                    </span>
                    <span>{auth.user.name}</span>
                </div>
            )}
        </div>
    );
}
