import { WireHighlights, Wire } from "@/types";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const wiresAtom = atomWithStorage<{ [key: Wire["uid"]]: Wire }>(
    "wires",
    {}
);
wiresAtom.debugLabel = "wires atom";

export const selectedWiresAtom = atom(new Set<string>());
export const highlightedWireIdsAtom = atom<WireHighlights>([]);

export const addWireAtom = atom(null, (_, set, value: Wire) => {
    set(wiresAtom, (v) => ({
        ...v,
        [value.uid]: value,
    }));
});

export const updateWireAtom = atom(
    null,
    (get, set, value: { uid: string; updater: (v: Wire) => Partial<Wire> }) => {
        const wires = get(wiresAtom);
        const currentValue = wires[value.uid];
        const values = value.updater(currentValue);
        set(wiresAtom, {
            ...wires,
            [value.uid]: {
                ...currentValue,
                ...values,
            },
        });
    }
);
