import { Circuit, MenuState } from "@/types";
import { atom } from "jotai";

export const isMenuOpenAtom = atom<MenuState["isMenuOpen"]>(false);
export const isCircuitOpenAtom = atom<MenuState["isCircuitOpen"]>(false);
export const circTitleAtom = atom<Circuit["title"]>("DQ Flip flop and memory and something else");
