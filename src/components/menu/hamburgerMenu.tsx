import * as Popover from "@radix-ui/react-popover";
import { isMenuOpenAtom } from "@/state/ui";
import { useAtom } from "jotai";
import { Palette } from "./palette/palette";
import clsx from "clsx";
import { forwardRef } from "react";
import { paletteContentId } from "@/constants/constants";

export const HamburgerMenu = forwardRef<HTMLDivElement | null, {}>((_, ref) => {
    const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
    const isPinned = true;
    const handleOpenChange = (v: boolean) => {
        if (!isPinned) {
            setIsMenuOpen(v);
        }
    };
    return (
        <Popover.Root open={isMenuOpen} onOpenChange={handleOpenChange}>
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
            <Popover.Portal forceMount>
                <Popover.Content
                    id={paletteContentId}
                    className={clsx(
                        "z-10 bg-white p-3.5 ml-1 mt-[9.5px] rounded-tr-lg rounded-br-lg border border-gray-300",
                        "data-[state=closed]:hidden"
                    )}
                >
                    <Palette />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
});
HamburgerMenu.displayName = "HamburgerMenu";
