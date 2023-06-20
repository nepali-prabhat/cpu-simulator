import { MenuState } from "@/types";
import { atom } from "jotai";

export const isMenuOpenAtom = atom<MenuState["isMenuOpen"]>(true);
export const isCircuitOpenAtom = atom<MenuState["isCircuitOpen"]>(false);

export const activePaletteTabAtom = atom<MenuState["activeTab"]>("component");
export const paletteSearchAtom = atom<string>("");
