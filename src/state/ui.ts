import { ElementType, MenuState, PaletteTab } from "@/types";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { elementsConfigAtomsMap } from "./elementsConfig";

export const isMenuOpenAtom = atomWithStorage<MenuState["isMenuOpen"]>(
    "menu_open",
    true
);

export const activePaletteTabAtom = atomWithStorage<PaletteTab>(
    "active_menu_tab",
    "elements"
);
export const paletteSearchAtom = atom<string>("");

export const selectedElementTypeAtom = atomWithStorage<ElementType | undefined>(
    "selectedElementType",
    undefined
);

export const elementConfigAtomAtom = atom((get) => {
    const selectedElementType = get(selectedElementTypeAtom);
    const elementDefaultsAtom = selectedElementType
        ? elementsConfigAtomsMap.get(selectedElementType)
        : undefined;
    return elementDefaultsAtom;
});
