export const Memory = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            fill="none"
            viewBox="0 0 64 64"
        >
            <rect
                width={32}
                height={48}
                x={16}
                y={8}
                stroke="currentColor"
                strokeWidth={4}
                rx={4}
            />
            <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={3}
                d="m16 17 6.28 5.495a2 2 0 0 1 0 3.01L16 31"
            />
            <path
                fill="currentColor"
                d="M8 22a2 2 0 1 0 0 4v-4Zm0 4h8v-4H8v4ZM48 30h-2v4h2v-4Zm8 4a2 2 0 1 0 0-4v4Zm-8 0h8v-4h-8v4ZM8 44a2 2 0 1 0 0 4v-4Zm0 4h8v-4H8v4Z"
            />
        </svg>
    );
};
