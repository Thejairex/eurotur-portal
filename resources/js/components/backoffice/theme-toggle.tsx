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
 * Selector de modo claro / oscuro / sistema del backoffice. Usa el mismo
 * hook que Configuración > Apariencia (se guarda en el navegador), así que
 * la elección se recuerda entre visitas.
 */
export function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div
            role="group"
            aria-label="Modo de color"
            className="flex items-center border border-border"
        >
            {OPTIONS.map(({ value, icon: Icon, label }) => {
                const active = appearance === value;

                return (
                    <button
                        key={value}
                        type="button"
                        title={label}
                        aria-label={label}
                        aria-pressed={active}
                        onClick={() => updateAppearance(value)}
                        className={
                            'flex size-7 items-center justify-center transition-colors duration-[120ms] ' +
                            (active
                                ? 'bg-foreground text-background'
                                : 'text-muted-foreground hover:bg-primary hover:text-primary-foreground')
                        }
                    >
                        <Icon className="size-3.5" />
                    </button>
                );
            })}
        </div>
    );
}
