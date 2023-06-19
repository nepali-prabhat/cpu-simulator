export const NAndGate = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            fill="none"
            viewBox="0 0 64 64"
        >
            <path
                stroke="currentColor"
                strokeWidth={4}
                d="M49 32c0 12.387-8.073 22-20 22h-8a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2h8c11.927 0 20 9.613 20 22Z"
            />
            <path
                fill="currentColor"
                d="M9 16a2 2 0 1 0 0 4v-4Zm0 4h10v-4H9v4Zm0 24a2 2 0 1 0 0 4v-4Zm0 4h10v-4H9v4Z"
            />
            <circle
                cx={53}
                cy={32}
                r={4}
                fill="none"
                stroke="currentColor"
                strokeWidth={4}
            />
        </svg>
    );
};
