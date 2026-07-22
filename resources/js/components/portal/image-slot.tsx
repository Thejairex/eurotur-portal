export function ImageSlot({
    src,
    alt,
    placeholder,
}: {
    src?: string;
    alt?: string;
    placeholder: string;
}) {
    if (src) {
        return (
            <img
                src={src}
                alt={alt ?? placeholder}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
        );
    }

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                    'repeating-linear-gradient(45deg,#111 0 2px,#e9e9e9 2px 11px)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '16px',
            }}
        >
            <span
                style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#000',
                    background: '#fff',
                    padding: '4px 8px',
                }}
            >
                {placeholder}
            </span>
        </div>
    );
}
