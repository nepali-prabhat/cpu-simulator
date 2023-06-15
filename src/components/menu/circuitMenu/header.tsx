export const MenuHeader = () => {
    return (
        <div className="px-2">
            <h1 className="flex gap-5 items-center font-medium">
                <div className="ml-0.5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 512"
                        width="1em"
                        height="1em"
                    >
                        <path d="M368 320h-96c-26.51 0-48 21.49-48 48v96c0 26.51 21.49 48 48 48h96c26.51 0 48-21.49 48-48v-96c0-26.51-21.49-48-48-48Zm0 144h-96v-96h96v96ZM591.832 0h-96c-26.51 0-48 21.49-48 48v96c0 26.51 21.49 48 48 48h96c26.51 0 48-21.49 48-48V48c0-26.51-21.49-48-48-48Zm0 144h-96V48h96v96ZM392 72H192V48c0-26.51-21.49-48-48-48H48C21.49 0 0 21.49 0 48v96c0 26.51 21.49 48 48 48h90.066l57.09 99.906c4.438 7.75 12.532 12.094 20.875 12.094 4.032 0 8.125-1.031 11.875-3.156 11.5-6.594 15.5-21.25 8.938-32.75l-54.537-95.442C188.314 164.637 192 154.787 192 144v-24h200c13.25 0 24-10.75 24-24s-10.75-24-24-24Zm-248 72H48V48h96v96Z" />
                    </svg>
                </div>
                <div>Circuits</div>
            </h1>
        </div>
    );
};

