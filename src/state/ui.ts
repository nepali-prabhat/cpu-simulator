import { ElementType, MenuState, PaletteTab } from "@/types";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { elementsConfigAtomsMap } from "./elementsConfig";
import { selectedElementConfigAtomAtom } from "./elements";

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

export const selectedElementIdsAtom = atom<Set<string>>(new Set<string>());
export const selectedWireIdsAtom = atom<Set<string>>(new Set<string>());
export const selectedPinIdsAtom = atom<Set<string>>(new Set<string>());

export const elementConfigAtomAtom = atom((get) => {
    const selectedElementType = get(selectedElementTypeAtom);
    const elementDefaultsAtom = selectedElementType
        ? elementsConfigAtomsMap.get(selectedElementType)
        : undefined;
    return elementDefaultsAtom;
});

export const rotateActiveElementConfigAtom = atom(
    null,
    (get, set, value: number) => {
        const elementConfigAtom = get(elementConfigAtomAtom);
        if (elementConfigAtom) {
            const currentValue = get(elementConfigAtom);
            set(elementConfigAtom, {
                ...currentValue,
                rotation: ((currentValue.rotation || 0) + value) % 360,
            });
        }
        const selectedElementConfigAtom = get(selectedElementConfigAtomAtom);
        if (selectedElementConfigAtom) {
            set(selectedElementConfigAtom, (currentValue) => ({
                ...currentValue,
                rotation: ((currentValue.rotation || 0) + value) % 360,
            }));
        }
    }
);

export const addToActiveInputsCountAtom = atom(
    null,
    (get, set, value: number) => {
        const elementConfigAtom = get(elementConfigAtomAtom);
        if (elementConfigAtom) {
            const currentValue = get(elementConfigAtom);
            set(elementConfigAtom, {
                ...currentValue,
                inputsCount: currentValue.inputsCount
                    ? currentValue.inputsCount + value
                    : undefined,
            });
        }
        const selectedElementConfigAtom = get(selectedElementConfigAtomAtom);
        if (selectedElementConfigAtom) {
            set(selectedElementConfigAtom, (currentValue) => ({
                ...currentValue,
                inputsCount: currentValue.inputsCount
                    ? currentValue.inputsCount + value
                    : undefined,
            }));
        }
    }
);
