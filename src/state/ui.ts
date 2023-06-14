import { MenuState } from "@/types";
import { atom } from "jotai";

export const isMenuOpenAtom = atom<MenuState["isMenuOpen"]>(false);
export const isCircuitOpenAtom = atom<MenuState["isCircuitOpen"]>(false);
