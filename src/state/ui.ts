import { MenuState, PaletteTab } from "@/types";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const isMenuOpenAtom = atomWithStorage<MenuState["isMenuOpen"]>(
    "menu_open",
    true
);

export const activePaletteTabAtom = atomWithStorage<PaletteTab>(
    "active_menu_tab",
    "elements"
);
export const paletteSearchAtom = atom<string>("");
