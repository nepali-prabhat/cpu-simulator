import { MenuState, PaletteTab } from "@/types";
import { atom } from "jotai";
import { activeElementTypeAtom } from "./appState";

export const isMenuOpenAtom = atom<MenuState["isMenuOpen"]>(true);
export const isCircuitOpenAtom = atom<MenuState["isCircuitOpen"]>(false);

export const activePaletteTabAtom = atom<PaletteTab>("elements");
export const paletteSearchAtom = atom<string>("");
