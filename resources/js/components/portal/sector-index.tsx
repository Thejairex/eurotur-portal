import { Form, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import SectorGroupController from '@/actions/App/Http/Controllers/Portal/SectorGroupController';
import SectorItemController from '@/actions/App/Http/Controllers/Portal/SectorItemController';
import InputError from '@/components/input-error';
import { MaintLine } from '@/components/portal/maint-line';
import { sectorPermission, usePermissions } from '@/hooks/use-permissions';
import { formatMaintLine } from '@/lib/sector-updated';

const RED = '#E3000F';
const SECONDARY = '#6B6B68';

export type SectorItem = {
    id?: number;
    t: string;
    h?: string | null;
    badge?: string | null;
};
export type SectorGroup = { id?: number; title: string; items: SectorItem[] };

/** Ícono de línea (viewBox 24) según el tema del bloque; si no hay coincidencia, una carpeta. */
const GROUP_ICONS: [RegExp, string][] = [
    [
        /transport|servicios|vehicul|traslad|flota/i,
        'M3 16V8h11v8M14 11h4l3 3v2h-7M7 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z',
    ],
    [
        /hotel|aloja|restaurant/i,
        'M4 20V6a1 1 0 011-1h9a1 1 0 011 1v14M15 10h4a1 1 0 011 1v9M3 20h18M8 9h3M8 13h3M8 17h3',
    ],
    [
        /interno|equipo|responsable|empleado|personal|rrhh|organigrama/i,
        'M16 11a3 3 0 100-6 3 3 0 000 6zM8 12a3 3 0 100-6 3 3 0 000 6zM2 20c0-3 3-5 6-5s6 2 6 5M14 15c3 0 8 1 8 5',
    ],
    [
        /sucursal|oficina|buenos aires|ushuaia|calafate|salta|mesa de tr/i,
        'M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    ],
    [/a[eé]reo|vuelo|viaje|famtrip/i, 'M21 3L3 11l7 3 3 7z'],
    [
        /horario|guardia|calendario|feriado|fecha/i,
        'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
    ],
    [
        /pago|cuenta|banc|cambio|factur|imposit|contab|cobr|transfer/i,
        'M7 7h13M16 3l4 4-4 4M17 17H4M8 13l-4 4 4 4',
    ],
    [
        /legal|seguridad|contingenc|seguro/i,
        'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    ],
    [
        /alta|formulario|procedim|document|instruc|manual|pol[ií]tic|norma/i,
        'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
    ],
    [
        /cliente|sales|venta|comercial|crédito|credito/i,
        'M4 20V10M10 20V4M16 20v-8M22 20H2',
    ],
    [
        /soporte|ticket|telef|zoiper|tecnolog|sistema|vpn|equipos|google|meet/i,
        'M3 4h18v12H3zM8 20h8M12 16v4',
    ],
    [
        /foto|imagen|galer/i,
        'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M9 9a1 1 0 100-2 1 1 0 000 2z',
    ],
    [
        /novedad|newsletter|reporte|informe/i,
        'M4 5h13v15H4zM17 9h3v9a2 2 0 01-2 2M7 9h7M7 13h7M7 17h4',
    ],
    [
        /grupo|salida|tour|excursi|producto|herramienta/i,
        'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
    ],
];

const FOLDER_ICON =
    'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z';

function iconPathFor(title: string): string {
    return (
        GROUP_ICONS.find(([pattern]) => pattern.test(title))?.[1] ?? FOLDER_ICON
    );
}

function iconButtonStyle(color: string): React.CSSProperties {
    return {
        all: 'unset',
        cursor: 'pointer',
        fontFamily: "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
        fontSize: '11px',
        color,
    };
}

export type SectorIndexData = {
    kicker: string;
    title: string;
    intro: string;
    maint: string;
    groups: SectorGroup[];
};

const labelFieldStyle: React.CSSProperties = {
    width: '100%',
    fontFamily: "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
    fontSize: '12.5px',
    fontWeight: 500,
    border: 'none',
    borderBottom: '1px solid #000',
    borderRadius: 0,
    padding: '4px 0',
    marginBottom: '6px',
};

const smallButtonStyle: React.CSSProperties = {
    fontFamily: "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
    fontSize: '9px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    background: 'transparent',
    border: '1px solid #000',
    padding: '4px 8px',
    cursor: 'pointer',
};

/**
 * Acomodo sin huecos de la cuadrícula: tarjetas grandes (5 o más links) ocupan 2 filas y las
 * chicas 1. Se arman bandas de 2 filas en el orden del portal anterior: la primera grande a la
 * izquierda, la última grande a la derecha y las chicas apiladas de a dos en el medio; si queda
 * una chica impar se pasa a grande. Se recalcula al cambiar el ancho o el contenido.
 */
type PackItem = { el: HTMLElement; big: boolean };

function pairsOf(items: PackItem[]): PackItem[][] {
    const pairs: PackItem[][] = [];

    for (let i = 0; i < items.length; i += 2) {
        pairs.push(items.slice(i, i + 2));
    }

    return pairs;
}

function packGrid(grid: HTMLElement): void {
    const cards = Array.from(grid.children) as HTMLElement[];

    cards.forEach((card) => {
        card.style.gridColumn = '';
        card.style.gridRow = '';
    });

    const columns =
        getComputedStyle(grid).gridTemplateColumns.split(' ').length;

    if (columns < 2) {
        cards.forEach((card) => {
            card.style.gridRow = 'auto';
        });

        return;
    }

    if (columns < 3) {
        return;
    }

    let rest: PackItem[] = cards.map((el) => ({
        el,
        big: el.dataset.big === '1',
    }));
    let band = 0;

    while (rest.length > 0) {
        const bigs: PackItem[] = [];
        const smalls: PackItem[] = [];
        let take = 0;

        for (; take < rest.length; take++) {
            const item = rest[take];
            const nextBigs = bigs.length + (item.big ? 1 : 0);
            const nextSmalls = smalls.length + (item.big ? 0 : 1);

            if (nextBigs + Math.ceil(nextSmalls / 2) > columns) {
                break;
            }

            (item.big ? bigs : smalls).push(item);
        }

        if (take === 0) {
            take = 1;
            bigs.push(rest[0]);
        }

        rest = rest.slice(take);

        let promoted = false;

        if (smalls.length % 2 === 1) {
            bigs.push(smalls.pop() as PackItem);
            promoted = true;
        }

        const row = band * 2 + 1;
        const first = bigs[0];
        const last = bigs.length > 1 ? bigs[bigs.length - 1] : null;
        const middle = bigs.slice(1, bigs.length > 1 ? -1 : undefined);
        let cols: (PackItem | PackItem[])[];

        if (bigs.length === 1 && promoted) {
            cols = [...pairsOf(smalls), bigs[0]];
        } else if (bigs.length === 0) {
            cols = pairsOf(smalls);
        } else {
            cols = [
                first,
                ...middle,
                ...pairsOf(smalls),
                ...(last ? [last] : []),
            ];
        }

        // Si la banda usa menos columnas que las disponibles, se reparten las que sobran entre
        // sus tarjetas (de izquierda a derecha) para que la fila llene todo el ancho.
        const spare = Math.max(0, columns - cols.length);
        let start = 1;

        cols.forEach((col, index) => {
            const span =
                1 +
                Math.floor(spare / cols.length) +
                (index < spare % cols.length ? 1 : 0);
            const columnRange = `${start} / span ${span}`;

            start += span;

            if (Array.isArray(col)) {
                col.forEach((small, k) => {
                    small.el.style.gridColumn = columnRange;
                    small.el.style.gridRow = `${row + k} / span 1`;
                });
            } else {
                col.el.style.gridColumn = columnRange;
                col.el.style.gridRow = `${row} / span 2`;
            }
        });

        band++;
    }
}

export function SectorIndex({
    data,
    sector,
}: {
    data: SectorIndexData;
    sector: string;
}) {
    const { can } = usePermissions();
    const { sectorUpdates } = usePage().props;
    // Editing is scoped to the sector this index renders, not to the portal
    // as a whole: a sector editor must not see controls they cannot use.
    const { url } = usePage();
    const canEdit = can(sectorPermission(sector));
    // "Editar páginas" del Back Office abre la página con la edición ya activa (?editar=1).
    const [editing, setEditing] = useState(canEdit && url.includes('editar=1'));
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);

    const moveTo = (groupId: number, position: number) =>
        router.post(
            SectorGroupController.move.url({ group: groupId }),
            { position },
            { preserveScroll: true },
        );

    // Arrastre propio con el puntero (en vez del arrastre nativo del navegador, que con botones falla en
    // algunos navegadores): se sigue el mouse o el dedo y al soltar se mueve el bloque al lugar elegido.
    const startDrag = (groupId: number, event: React.PointerEvent) => {
        if (event.button !== 0) {
            return;
        }

        event.preventDefault();
        setDraggingId(groupId);

        const indexAt = (x: number, y: number): number | null => {
            const card = document
                .elementFromPoint(x, y)
                ?.closest<HTMLElement>('[data-group-index]');

            return card ? Number(card.dataset.groupIndex) : null;
        };
        const stop = () => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointercancel', onCancel);
            setDraggingId(null);
            setOverIndex(null);
        };
        const onMove = (e: PointerEvent) =>
            setOverIndex(indexAt(e.clientX, e.clientY));
        const onUp = (e: PointerEvent) => {
            const to = indexAt(e.clientX, e.clientY);
            const from = data.groups.findIndex((g) => g.id === groupId);

            stop();

            if (to !== null && to !== from) {
                moveTo(groupId, to);
            }
        };
        const onCancel = () => stop();

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onCancel);
    };
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const grid = gridRef.current;

        if (!grid) {
            return;
        }

        packGrid(grid);

        const observer = new ResizeObserver(() => packGrid(grid));

        observer.observe(grid);

        return () => observer.disconnect();
    }, [data.groups, editing]);

    return (
        <section
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                style={{
                    fontSize: '12px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: SECONDARY,
                    margin: '6px 0 0',
                }}
            >
                {data.kicker}
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '24px',
                }}
            >
                <h1
                    style={{
                        fontSize: 'clamp(44px,5vw,60px)',
                        fontWeight: 800,
                        margin: '6px 0',
                        letterSpacing: '-1.5px',
                        lineHeight: 1.05,
                    }}
                >
                    {data.title}
                    <span style={{ color: RED }}>.</span>
                </h1>
                {canEdit && (
                    <button
                        type="button"
                        onClick={() => setEditing((v) => !v)}
                        style={{
                            ...smallButtonStyle,
                            flex: '0 0 auto',
                            background: editing ? RED : 'transparent',
                            color: editing ? '#fff' : '#111',
                            borderColor: editing ? RED : '#111',
                        }}
                    >
                        {editing ? 'Listo ✕' : 'Editar ✎'}
                    </button>
                )}
            </div>
            <p
                style={{
                    color: SECONDARY,
                    maxWidth: '620px',
                    margin: '0 0 30px',
                    lineHeight: 1.5,
                    fontSize: '16px',
                }}
            >
                {data.intro}
            </p>

            <div
                ref={gridRef}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gridAutoRows: 'minmax(228px, auto)',
                    gridAutoFlow: 'dense',
                    gap: '18px',
                }}
            >
                {data.groups.map((g, i) => (
                    <SectorGroupColumn
                        key={g.id ?? g.title}
                        group={g}
                        editing={editing}
                        index={i}
                        isFirst={i === 0}
                        isLast={i === data.groups.length - 1}
                        draggingId={draggingId}
                        overIndex={overIndex}
                        onHandleDown={startDrag}
                        onMoveTo={moveTo}
                    />
                ))}
            </div>

            {editing && (
                <div style={{ marginTop: '18px' }}>
                    <AddGroupForm sector={sector} />
                </div>
            )}

            <MaintLine>
                {formatMaintLine(data.maint, sectorUpdates[sector])}
            </MaintLine>
        </section>
    );
}

function SectorGroupColumn({
    group,
    editing,
    index,
    isFirst,
    isLast,
    draggingId,
    overIndex,
    onHandleDown,
    onMoveTo,
}: {
    group: SectorGroup;
    editing: boolean;
    index: number;
    isFirst: boolean;
    isLast: boolean;
    draggingId: number | null;
    overIndex: number | null;
    onHandleDown: (groupId: number, event: React.PointerEvent) => void;
    onMoveTo: (groupId: number, position: number) => void;
}) {
    const [addingItem, setAddingItem] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    return (
        <section
            className={group.items.length >= 5 ? 'card card-l' : 'card'}
            data-big={group.items.length >= 5 ? '1' : '0'}
            data-group-index={index}
            style={
                draggingId === group.id
                    ? { opacity: 0.45 }
                    : draggingId !== null && overIndex === index
                      ? { outline: `2px dashed ${RED}`, outlineOffset: '-2px' }
                      : undefined
            }
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '10px',
                    marginBottom: '10px',
                }}
            >
                {renaming && group.id ? (
                    <Form
                        {...SectorGroupController.update.form({
                            group: group.id,
                        })}
                        onSuccess={() => setRenaming(false)}
                        style={{ flex: 1 }}
                    >
                        {({ processing, errors }) => (
                            <>
                                <RequiredField
                                    name="title"
                                    placeholder="Título del bloque"
                                    defaultValue={group.title}
                                />
                                <InputError message={errors.title} />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        style={smallButtonStyle}
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRenaming(false)}
                                        style={smallButtonStyle}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        )}
                    </Form>
                ) : (
                    <h2
                        style={{
                            fontSize: '17px',
                            fontWeight: 700,
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            lineHeight: 1.25,
                        }}
                    >
                        <svg
                            className="ico"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d={iconPathFor(group.title)} />
                        </svg>
                        {group.title}
                    </h2>
                )}
                {editing && group.id && !renaming && (
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            flex: '0 0 auto',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <button
                            type="button"
                            title="Arrastrar para mover (o Alt + flechas)"
                            aria-label="Mover bloque"
                            onPointerDown={(event) => {
                                if (group.id) {
                                    onHandleDown(group.id, event);
                                }
                            }}
                            onKeyDown={(event) => {
                                if (!event.altKey || !group.id) {
                                    return;
                                }

                                if (event.key === 'ArrowUp' && !isFirst) {
                                    event.preventDefault();
                                    onMoveTo(group.id, index - 1);
                                } else if (
                                    event.key === 'ArrowDown' &&
                                    !isLast
                                ) {
                                    event.preventDefault();
                                    onMoveTo(group.id, index + 1);
                                }
                            }}
                            style={{
                                ...iconButtonStyle(SECONDARY),
                                cursor: 'grab',
                                touchAction: 'none',
                            }}
                        >
                            ⋮⋮
                        </button>
                        {!isFirst && (
                            <MoveGroupButton
                                groupId={group.id}
                                direction="up"
                            />
                        )}
                        {!isLast && (
                            <MoveGroupButton
                                groupId={group.id}
                                direction="down"
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => setRenaming(true)}
                            title="Renombrar bloque"
                            style={iconButtonStyle(SECONDARY)}
                        >
                            ✎
                        </button>
                        {confirmingDelete ? (
                            <>
                                <span style={{ fontSize: '12px' }}>
                                    ¿Eliminar el bloque y sus links?
                                </span>
                                <Form
                                    {...SectorGroupController.destroy.form({
                                        group: group.id,
                                    })}
                                >
                                    {({ processing }) => (
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            style={{
                                                ...smallButtonStyle,
                                                background: RED,
                                                color: '#fff',
                                                borderColor: RED,
                                            }}
                                        >
                                            Sí, eliminar
                                        </button>
                                    )}
                                </Form>
                                <button
                                    type="button"
                                    onClick={() => setConfirmingDelete(false)}
                                    style={smallButtonStyle}
                                >
                                    No
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setConfirmingDelete(true)}
                                title="Eliminar bloque"
                                style={iconButtonStyle(RED)}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {group.items.map((item) => (
                    <SectorItemRow
                        key={item.id ?? item.t}
                        item={item}
                        editing={editing}
                    />
                ))}
            </div>

            {editing && group.id && (
                <div style={{ marginTop: '12px' }}>
                    {addingItem ? (
                        <AddItemForm
                            groupId={group.id}
                            onDone={() => setAddingItem(false)}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setAddingItem(true)}
                            style={smallButtonStyle}
                        >
                            + agregar link
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}

function MoveGroupButton({
    groupId,
    direction,
}: {
    groupId: number;
    direction: 'up' | 'down';
}) {
    return (
        <Form {...SectorGroupController.move.form({ group: groupId })}>
            {({ processing }) => (
                <>
                    <input type="hidden" name="direction" value={direction} />
                    <button
                        type="submit"
                        disabled={processing}
                        title={
                            direction === 'up' ? 'Subir bloque' : 'Bajar bloque'
                        }
                        style={iconButtonStyle(SECONDARY)}
                    >
                        {direction === 'up' ? '↑' : '↓'}
                    </button>
                </>
            )}
        </Form>
    );
}

function RequiredField({
    name,
    placeholder,
    defaultValue,
}: {
    name: string;
    placeholder: string;
    defaultValue?: string;
}) {
    const [invalid, setInvalid] = useState(false);

    return (
        <div>
            <input
                name={name}
                placeholder={placeholder}
                defaultValue={defaultValue}
                required
                aria-invalid={invalid || undefined}
                onInvalid={() => setInvalid(true)}
                onInput={(e) => {
                    if (e.currentTarget.value) {
                        setInvalid(false);
                    }
                }}
                style={{
                    ...labelFieldStyle,
                    borderColor: invalid ? RED : undefined,
                }}
            />
            {invalid && <InputError message="Completa este campo" />}
        </div>
    );
}

function SectorItemRow({
    item,
    editing,
}: {
    item: SectorItem;
    editing: boolean;
}) {
    const [editingItem, setEditingItem] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    if (editing && item.id && editingItem) {
        return (
            <EditItemForm
                item={item}
                itemId={item.id}
                onDone={() => setEditingItem(false)}
            />
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: '8px',
            }}
        >
            {item.h ? (
                <a
                    href={item.h}
                    target="_blank"
                    rel="noreferrer"
                    className="doc-link"
                    style={{ flex: '1 1 auto' }}
                >
                    <span>{item.t}</span>
                    <span className="doc-arrow" aria-hidden="true">
                        ↗
                    </span>
                </a>
            ) : (
                <div
                    style={{
                        fontFamily:
                            "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                        fontWeight: 500,
                        fontSize: '14.5px',
                        lineHeight: 1.4,
                        color: SECONDARY,
                        padding: '10px 0',
                    }}
                >
                    {item.t}
                </div>
            )}
            {item.badge && (
                <span
                    style={{
                        fontFamily:
                            "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                        fontSize: '9px',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: RED,
                        border: `1px solid ${RED}`,
                        padding: '2px 5px',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {item.badge}
                </span>
            )}
            {editing && item.id && (
                <div
                    style={{
                        display: 'flex',
                        gap: '6px',
                        flex: '0 0 auto',
                        whiteSpace: 'nowrap',
                        marginLeft: 'auto',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setEditingItem(true)}
                        title="Editar"
                        style={{
                            all: 'unset',
                            cursor: 'pointer',
                            fontFamily:
                                "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                            fontSize: '10px',
                            color: '#666',
                        }}
                    >
                        ✎
                    </button>
                    {confirmingDelete ? (
                        <>
                            <Form
                                {...SectorItemController.destroy.form({
                                    item: item.id,
                                })}
                            >
                                {({ processing }) => (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        style={{
                                            ...smallButtonStyle,
                                            background: RED,
                                            color: '#fff',
                                            borderColor: RED,
                                        }}
                                    >
                                        Sí, eliminar
                                    </button>
                                )}
                            </Form>
                            <button
                                type="button"
                                onClick={() => setConfirmingDelete(false)}
                                style={smallButtonStyle}
                            >
                                No
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmingDelete(true)}
                            title="Eliminar"
                            style={{
                                all: 'unset',
                                cursor: 'pointer',
                                fontFamily:
                                    "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                fontSize: '10px',
                                color: RED,
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function AddGroupForm({ sector }: { sector: string }) {
    return (
        <Form
            {...SectorGroupController.store.form({ sector })}
            resetOnSuccess
            className="flex items-end gap-3"
        >
            {({ processing, errors }) => (
                <>
                    <div style={{ flex: 1, maxWidth: '280px' }}>
                        <RequiredField
                            name="title"
                            placeholder="Nuevo grupo…"
                        />
                        <InputError message={errors.title} />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        style={smallButtonStyle}
                    >
                        + agregar grupo
                    </button>
                </>
            )}
        </Form>
    );
}

function AddItemForm({
    groupId,
    onDone,
}: {
    groupId: number;
    onDone: () => void;
}) {
    const [mode, setMode] = useState<'url' | 'file'>('url');

    return (
        <Form
            {...SectorItemController.store.form({ group: groupId })}
            resetOnSuccess
            onSuccess={onDone}
            className="flex flex-col gap-2"
            style={{ minWidth: '180px' }}
        >
            {({ processing, errors }) => (
                <>
                    <RequiredField name="label" placeholder="Texto del link" />
                    <InputError message={errors.label} />

                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            fontSize: '10px',
                        }}
                    >
                        <label
                            style={{
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="radio"
                                checked={mode === 'url'}
                                onChange={() => setMode('url')}
                            />
                            URL
                        </label>
                        <label
                            style={{
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="radio"
                                checked={mode === 'file'}
                                onChange={() => setMode('file')}
                            />
                            Archivo
                        </label>
                    </div>

                    {mode === 'url' ? (
                        <input
                            name="url"
                            type="url"
                            placeholder="https://…"
                            style={labelFieldStyle}
                        />
                    ) : (
                        <input
                            name="file"
                            type="file"
                            style={{ fontSize: '11px' }}
                        />
                    )}
                    <InputError message={errors.url} />
                    <InputError message={errors.file} />

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="submit"
                            disabled={processing}
                            style={smallButtonStyle}
                        >
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={onDone}
                            style={smallButtonStyle}
                        >
                            Cancelar
                        </button>
                    </div>
                </>
            )}
        </Form>
    );
}

function EditItemForm({
    item,
    itemId,
    onDone,
}: {
    item: SectorItem;
    itemId: number;
    onDone: () => void;
}) {
    const [mode, setMode] = useState<'url' | 'file'>('url');

    return (
        <Form
            {...SectorItemController.update.form({ item: itemId })}
            onSuccess={onDone}
            className="flex flex-col gap-2"
        >
            {({ processing, errors }) => (
                <>
                    <RequiredField
                        name="label"
                        placeholder="Texto del link"
                        defaultValue={item.t}
                    />
                    <InputError message={errors.label} />

                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            fontSize: '10px',
                        }}
                    >
                        <label
                            style={{
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="radio"
                                checked={mode === 'url'}
                                onChange={() => setMode('url')}
                            />
                            URL
                        </label>
                        <label
                            style={{
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="radio"
                                checked={mode === 'file'}
                                onChange={() => setMode('file')}
                            />
                            Reemplazar por archivo
                        </label>
                    </div>

                    {mode === 'url' ? (
                        <input
                            name="url"
                            type="url"
                            defaultValue={item.h ?? ''}
                            placeholder="https://…"
                            style={labelFieldStyle}
                        />
                    ) : (
                        <input
                            name="file"
                            type="file"
                            style={{ fontSize: '11px' }}
                        />
                    )}
                    <InputError message={errors.url} />
                    <InputError message={errors.file} />

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="submit"
                            disabled={processing}
                            style={smallButtonStyle}
                        >
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={onDone}
                            style={smallButtonStyle}
                        >
                            Cancelar
                        </button>
                    </div>
                </>
            )}
        </Form>
    );
}
