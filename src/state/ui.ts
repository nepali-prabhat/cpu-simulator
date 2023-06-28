import { ElementType, MenuState, PaletteTab } from "@/types";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { elementsConfigAtomsMap } from "./elementsConfig";
import { ghostElementAtom } from "./appState";

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

export const rotateGhostElementAtom = atom(null, (get, set, value: number) => {
    const elementConfigAtom = get(elementConfigAtomAtom);
    const ghostElement = get(ghostElementAtom);
    if (ghostElement && elementConfigAtom) {
        const currentValue = get(elementConfigAtom);
        set(elementConfigAtom, {
            ...currentValue,
            rotation:
                ((ghostElement?.elementConfig?.rotation || 0) + value) % 360,
        });
    }
});
