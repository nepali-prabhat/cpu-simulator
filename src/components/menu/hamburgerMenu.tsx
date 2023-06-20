import * as Popover from "@radix-ui/react-popover";
import { isMenuOpenAtom } from "@/state/ui";
import { useAtom } from "jotai";
import { Palette } from "./palette/palette";

export const HamburgerMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
    return (
        <Popover.Root open={isMenuOpen}>
            <Popover.Trigger asChild onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <button className="p-2.5 rounded-lg hover:bg-gray-200 focus:bg-gray-100 outline-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        width="1em"
                        height="1em"
                    >
                        <title>Hamburger menu</title>
                        <path d="M416 224H32c-17.673 0-32 14.327-32 32 0 17.673 14.327 32 32 32h384c17.673 0 32-14.327 32-32 0-17.673-14.327-32-32-32Zm0 160H32c-17.673 0-32 14.327-32 32 0 17.673 14.327 32 32 32h384c17.673 0 32-14.327 32-32 0-17.673-14.327-32-32-32Zm0-320H32C14.327 64 0 78.327 0 96c0 17.673 14.327 32 32 32h384c17.673 0 32-14.327 32-32 0-17.673-14.327-32-32-32Z" />
                    </svg>
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className={
                        "z-10 p-3.5 ml-1 mt-3 bg-white rounded-tr-lg rounded-br-lg border border-gray-300"
                    }
                >
                    <Palette />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};
