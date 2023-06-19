import * as Popover from "@radix-ui/react-popover";

// React sortable
import clsx from "clsx";
import { useAtom } from "jotai";
import { isMenuOpenAtom } from "@/state/ui";
import { MenuHeader } from "./header";
import { AddCircuit } from "./addCircuit";
import { CircuitsList } from "./circuitsList";

const CircuitMenuPopup = () => {
    return (
        <div className="flex flex-col">
            <MenuHeader />
            <hr className="my-2" />
            <CircuitsList />
            <hr className="mt-2 mb-1" />
            <AddCircuit />
        </div>
    );
};

export const CircuitMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
    return (
        <Popover.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <Popover.Trigger asChild>
                <button
                    aria-label="Open circuits list"
                    className="group p-2.5 rounded-lg hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100 outline-2"
                >
                    <svg
                        className="group-hover:translate-y-0.5 group-data-[state=open]:translate-y-0.5 transition-transform duration-100 ease-in-out"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        width="1em"
                        height="1em"
                    >
                        <path d="M435.658 228.913 251.656 404.907C243.922 412.313 233.953 416 224 416s-19.922-3.687-27.656-11.093L12.342 228.913c-15.953-15.28-16.516-40.592-1.25-56.56 15.281-15.999 40.594-16.499 56.563-1.25L224 320.66l156.345-149.557c15.969-15.281 41.282-14.718 56.563 1.25 15.266 15.968 14.703 41.28-1.25 56.56Z" />
                    </svg>
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className={clsx(
                        "shadow-md px-5 py-5 ml-2 mt-3 bg-white rounded-lg border border-gray-300"
                    )}
                >
                    <CircuitMenuPopup />
                    <Popover.Close
                        aria-label="Close circuits list"
                        hidden={true}
                    >
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    </Popover.Close>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};
