export const CircuitIcon = (
    props: React.PropsWithoutRef<React.SVGProps<SVGElement>>
) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            fill="none"
            viewBox="0 0 64 64"
            {...props}
        >
            <rect
                width={15}
                height={15}
                x={8}
                y={23}
                stroke="currentColor"
                strokeWidth={6}
                rx={4}
                transform="rotate(-90 8 23)"
            />
            <rect
                width={15}
                height={15}
                x={56}
                y={8}
                stroke="currentColor"
                strokeWidth={6}
                rx={4}
                transform="rotate(90 56 8)"
            />
            <rect
                width={15}
                height={15}
                x={8}
                y={56}
                stroke="currentColor"
                strokeWidth={6}
                rx={4}
                transform="rotate(-90 8 56)"
            />
            <path
                stroke="currentColor"
                strokeWidth={6}
                d="M23 13h18M13 40V22"
            />
        </svg>
    );
};
