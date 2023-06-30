import { Element, GhostElement } from "@/types";
import { atom } from "jotai";
import { nanoid } from "nanoid";

export const elementsAtom = atom<{ [key: Element["uid"]]: Element }>({});
elementsAtom.debugLabel = "elements atom";

export const addElementAtom = atom(null, (_, set, ge: GhostElement) => {
    const { show, ...rest } = ge;
    const uid = nanoid();
    const element: Element = {
        ...rest,
        uid,
        type: rest.config.type,
        zIndex: 0,
        config: atom(rest.config),
    };
    set(elementsAtom, (v) => ({ ...v, [uid]: element }));
});
