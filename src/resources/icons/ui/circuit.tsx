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
                x={23}
                y={41}
                stroke="#000"
                strokeWidth={6}
                rx={4}
                transform="rotate(90 23 41)"
            />
            <rect
                width={15}
                height={15}
                x={41}
                y={23}
                stroke="#000"
                strokeWidth={6}
                rx={4}
                transform="rotate(-90 41 23)"
            />
            <path stroke="#000" strokeWidth={6} d="M41 23 23 41" />
        </svg>
    );
};
