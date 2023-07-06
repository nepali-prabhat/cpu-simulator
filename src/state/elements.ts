import { Element, ElementConfig, GhostElement } from "@/types";
import { WithRequired } from "@/utilTypes";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { nanoid } from "nanoid";
import { selectedElementIdsAtom } from "./appState";
import { getElementRects } from "@/utils/box";

export const elementsAtom = atomWithStorage<{ [key: Element["uid"]]: Element }>(
    "elements",
    {}
);
elementsAtom.debugLabel = "elements atom";

export const addElementAtom = atom(
    null,
    (_, set, ge: WithRequired<GhostElement, "rect">) => {
        const { show, ...rest } = ge;
        const uid = nanoid();
        const element: Element = {
            ...rest,
            uid,
            type: rest.config.type,
            zIndex: 0,
            config: rest.config,
        };
        set(elementsAtom, (v) => ({ ...v, [uid]: element }));
    }
);

export const selectedElementConfigAtomAtom = atom((get) => {
    const selectedElementIds = get(selectedElementIdsAtom);
    if (selectedElementIds.size === 1) {
        for (let id of Object.values(Array.from(selectedElementIds))) {
            const elements = get(elementsAtom);
            if (elements[id]) {
                return atom(
                    (get) => {
                        const elements = get(elementsAtom);
                        return elements[id].config;
                    },
                    (
                        _,
                        set,
                        newConfig: (v: ElementConfig) => ElementConfig
                    ) => {
                        const elements = get(elementsAtom);
                        const config = newConfig(elements[id].config);
                        let elementRects =
                            config &&
                            getElementRects({
                                config: config,
                                position: [
                                    elements[id].rect[0],
                                    elements[id].rect[1],
                                ],
                            });
                        if (elementRects) {
                            set(elementsAtom, {
                                ...elements,
                                [id]: {
                                    ...elements[id],
                                    ...elementRects,
                                    config,
                                },
                            });
                        }
                    }
                );
            }
        }
    }
});
