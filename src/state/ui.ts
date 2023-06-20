import { MenuState, PaletteTab } from "@/types";
import { atom } from "jotai";

export const isMenuOpenAtom = atom<MenuState["isMenuOpen"]>(false);
export const isCircuitOpenAtom = atom<MenuState["isCircuitOpen"]>(false);

export const activePaletteTabAtom = atom<MenuState["activeTab"]>("component");
export const partialActivePaletteTabAtom = atom<
    MenuState["activeTab"] | undefined
>(undefined);
export const paletteSearchAtom = atom<string>("");

export const paletteContentHeightsAtom = atom<Map<PaletteTab, number>>(
    new Map()
);
export const paletteContentRefsAtom = atom<
    Map<PaletteTab, HTMLDivElement | null>
>(new Map());

export const updatePaletteHeightAtom = atom(null, (get, set) => {
    const paletteContentRefs = get(paletteContentRefsAtom);
    const heights = new Map(get(paletteContentHeightsAtom));
    const newHeight = paletteContentRefs.get("circuit")?.clientHeight;
    if (newHeight) {
        heights.set("circuit", newHeight);
    }
    set(paletteContentHeightsAtom, heights);
});
