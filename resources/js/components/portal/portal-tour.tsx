import { usePage } from '@inertiajs/react';
import { GuidedTour } from '@/components/guided-tour';
import type { TourPalette, TourStep } from '@/components/guided-tour';

const PALETTE: TourPalette = {
    background: '#fff',
    foreground: '#000',
    accent: '#E3000F',
    accentForeground: '#fff',
};

const STEPS: TourStep[] = [
    {
        id: 'bienvenida',
        title: 'Bienvenida/o al nuevo portal de Eurotur',
        body: 'Es el lugar donde está toda la información de la empresa: documentos, formularios, herramientas y datos de cada área. Te mostramos lo principal en un minuto. Este recorrido aparece solo esta vez.',
    },
    {
        id: 'buscador',
        target: '#portal-search-aside',
        title: 'Buscador',
        body: 'Escribe lo que necesites (un documento, un formulario, un sector) y el buscador te lleva directo. Es la forma más rápida de encontrar algo.',
    },
    {
        id: 'sectores',
        target: '#portal-nav',
        title: 'Un sector por área',
        body: 'Cada sector (Sales, Operaciones, Contrataciones, RRHH, IT y los demás) tiene su propia página con los documentos, los formularios y los enlaces de esa área.',
    },
    {
        id: 'dolar',
        target: '[data-testid="home-dollars"]',
        title: 'Cotización del dólar',
        body: 'En el inicio ves la cotización del dólar oficial del día, siempre a mano. Próximamente se suma el cambio para tarifario (USD, BRL y CLP).',
    },
    {
        id: 'organigrama',
        target: '[data-tour="portal-nav-rrhh"]',
        title: 'Nuevo: el Organigrama interactivo',
        body: 'Ahora la empresa tiene un organigrama navegable: pasa el mouse por cada persona y ves su ficha (puesto, sector, sede, mail e interno), filtra por sector o por sede y busca por nombre. Está en RRHH; el de Travel Designers, en su propio sector.',
        link: { label: 'Abrir el Organigrama', href: '/organigrama' },
    },
    {
        id: 'innovacion',
        target: '[data-tour="portal-nav-innovacion"]',
        title: 'Innovación',
        body: 'Acá se publican las iniciativas de mejora que lleva adelante el equipo, entre ellas el Organigrama interactivo.',
    },
    {
        id: 'backoffice',
        target: '.backoffice-btn',
        title: 'Back Office',
        body: 'Si tu rol lo permite, desde este botón entras al Back Office, donde están tus herramientas de trabajo. La primera vez que entres te mostramos también cómo funciona.',
    },
    {
        id: 'fin',
        title: '¡Listo!',
        body: 'Ya conoces lo principal del portal nuevo. Si algo no funciona o te confunde, cuéntale a Valentina.',
    },
];

/** Recorrido de la primera visita al portal nuevo (una sola vez por usuario, sin omitir). */
export function PortalTour() {
    const { tours } = usePage().props;

    return (
        <GuidedTour
            tour="portal"
            pending={tours.portal}
            steps={STEPS}
            palette={PALETTE}
        />
    );
}
