import { MenuState } from "@/types";
import { atom, getDefaultStore } from "jotai";

export const isMenuOpenAtom = atom<MenuState["isMenuOpen"]>(false);
export const isCircuitOpenAtom = atom<MenuState["isCircuitOpen"]>(false);

export const activePaletteTabAtom = atom<MenuState["activeTab"]>("component");
export const partialActivePaletteTabAtom = atom<
    MenuState["activeTab"] | undefined
>(undefined);
export const paletteSearchAtom = atom<string>("");

export const backgroundColorAtom = atom<{ bg: string; fg: string }>({
    bg: "#f3f0ff",
    fg: "#b197fc",
});

export const getUIStore = () => {
    return getDefaultStore();
};
