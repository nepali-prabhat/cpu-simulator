import { paletteSearchAtom } from "@/state/ui";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

export const PaletteSearch = () => {
    const [searchValue, setSearchValue] = useAtom(paletteSearchAtom);
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
        ref.current?.focus();
        const _keydownHandler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                ref.current?.focus();
            }
        };
        window.addEventListener("keydown", _keydownHandler);
        return () => {
            window.removeEventListener("keydown", _keydownHandler);
        };
    }, []);
    return (
        <input
            ref={ref}
            className={twMerge(
                `rounded px-2.5 py-1 truncate bg-inherit text-md bg-neutral-100`
            )}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for gates, actions, circuits..."
        />
    );
};
