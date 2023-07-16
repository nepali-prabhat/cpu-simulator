import { AppState, Element, ElementConfig, GhostElement } from "@/types";
import { WithRequired } from "@/utilTypes";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { nanoid } from "nanoid";
import { getElementRects } from "@/utils/box";
import { selectedIdsAtom } from "./ui";

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
export const deleteSelectedElementsAtom = atom(null, (get, set) => {
    const selectedElementIds = get(selectedIdsAtom);
    set(elementsAtom, (elements) => {
        const newElements: { [key: Element["uid"]]: Element } = {};
        for (let id of Object.keys(elements)) {
            if (!selectedElementIds.has(id)) {
                newElements[id] = elements[id];
            }
        }
        return newElements;
    });
});

export const selectedElementConfigAtomAtom = atom((get) => {
    const selectedElementIds = get(selectedIdsAtom);
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

export const moveSelectedElementsAtom = atom(
    null,
    (get, set, value: [number, number]) => {
        const selectedElementIds = get(selectedIdsAtom);
        const elements = get(elementsAtom);
        let updatedElements: AppState["elements"] = {};
        if (selectedElementIds.size > 0) {
            for (let id of Array.from(selectedElementIds)) {
                const element = elements[id];
                if (element) {
                    updatedElements[element.uid] = {
                        ...element,
                        rect: [
                            element.rect[0] + value[0],
                            element.rect[1] + value[1],
                            element.rect[2],
                            element.rect[3],
                        ],
                    };
                }
            }
        }
        set(elementsAtom, (v) => ({ ...v, ...updatedElements }));
    }
);
