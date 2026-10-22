import { Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';

const OPTIONS: { value: Appearance; icon: LucideIcon; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Modo claro' },
    { value: 'dark', icon: Moon, label: 'Modo oscuro' },
    { value: 'system', icon: Monitor, label: 'Igual que el sistema' },
];

/**
 * Selector de modo claro / oscuro / sistema. Vive dentro de "Configuración", en el menú
 * lateral. Usa el mismo hook que el resto del portal (se guarda en el navegador), así que
 * la elección se recuerda entre visitas.
 */
export function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div role="group" aria-label="Modo de color" className="bo-seg">
            {OPTIONS.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={appearance === value}
                    onClick={() => updateAppearance(value)}
                >
                    <Icon size={15} aria-hidden="true" />
                </button>
            ))}
        </div>
    );
}
