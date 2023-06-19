import { CircuitMenu } from "./circuitMenu/circuitMenu";
import { MenuInput } from "./menuInput";

export const Menu = () => {
    return (
        <section className="flex absolute top-0 left-0 gap-0.5 justify-center items-stretch py-1 px-1.5 m-1 bg-white rounded-br-lg border border-gray-300">
            <button className="p-2.5 rounded-lg hover:bg-gray-200 focus:bg-gray-200 outline-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    width="1em"
                    height="1em"
                >
                    <path d="M416 224H32c-17.673 0-32 14.327-32 32 0 17.673 14.327 32 32 32h384c17.673 0 32-14.327 32-32 0-17.673-14.327-32-32-32Zm0 160H32c-17.673 0-32 14.327-32 32 0 17.673 14.327 32 32 32h384c17.673 0 32-14.327 32-32 0-17.673-14.327-32-32-32Zm0-320H32C14.327 64 0 78.327 0 96c0 17.673 14.327 32 32 32h384c17.673 0 32-14.327 32-32 0-17.673-14.327-32-32-32Z" />
                </svg>
            </button>
            <div className="self-center bg-gray-300 rounded w-[2px] h-[18px]"></div>
            <MenuInput />
            <CircuitMenu />
        </section>
    );
};
