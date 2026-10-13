import { usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';
import { BACKOFFICE_TOOLS } from '@/lib/backoffice-tools';

/**
 * Reads the permission slugs shared by HandleInertiaRequests. Admins receive
 * the full catalogue server-side, so `can` needs no special case for them.
 */
export function usePermissions() {
    const { auth } = usePage().props;
    const permissions = useMemo(
        () => auth?.permissions ?? [],
        [auth?.permissions],
    );

    const can = useCallback(
        (permission: string) => permissions.includes(permission),
        [permissions],
    );

    const canAny = useCallback(
        (...candidates: string[]) =>
            candidates.some((permission) => permissions.includes(permission)),
        [permissions],
    );

    return { can, canAny, permissions, role: auth?.role ?? null };
}

export const sectorPermission = (sector: string) => `sector.${sector}.edit`;

/**
 * Permissions that unlock at least one card on the "Herramientas" hub —
 * mirrors the backend's `Permission::toolsPermissions()`. Derived from the
 * single list of tools (lib/backoffice-tools.ts), so every place gating access
 * to the hub (portal sidebar, backoffice sidebar) stays in sync when a tool is
 * added there.
 */
export const TOOLS_PERMISSIONS = BACKOFFICE_TOOLS.map((tool) => tool.permission);
