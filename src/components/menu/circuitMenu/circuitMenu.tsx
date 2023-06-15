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
                    className="group p-2.5 ml-0.5 rounded-lg hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100 outline-2"
                >
                    <svg
                        className="group-hover:translate-y-0.5 group-data-[state=open]:translate-y-0.5 transition duration-200 ease-in-out"
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className={clsx(
                        "px-5 py-5 ml-2 mt-3 bg-white rounded-lg border border-gray-300"
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
