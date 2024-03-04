import { WireHighlights, Wire, BoundingRect, Point, WireHandle } from "@/types";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { selectedWireIdsAtom } from "./ui";

export const wiresAtom = atomWithStorage<{ [key: Wire["uid"]]: Wire }>(
    "wires",
    {}
);
wiresAtom.debugLabel = "wires atom";

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

export const deleteWiresAtom = atom(null, (get, set, uids: string[]) => {
    const newWires: { [key: string]: Wire } = {};
    const wires = get(wiresAtom);
    for (let wire of Object.values(wires)) {
        if (!uids.includes(wire.uid)) {
            newWires[wire.uid] = wire;
        }
    }
    set(wiresAtom, newWires);
});

export const deleteSelectedWiresAtom = atom(null, (get, set) => {
    const uids = get(selectedWireIdsAtom);
    const newWires: { [key: string]: Wire } = {};
    const wires = get(wiresAtom);
    for (let wire of Object.values(wires)) {
        if (!uids.has(wire.uid)) {
            newWires[wire.uid] = wire;
        }
    }
    set(wiresAtom, newWires);
});

export const wireHandlesAtom = atom((get) => {
    const selectedWireIds = get(selectedWireIdsAtom);
    const wires = get(wiresAtom);
    let selectHandles: WireHandle[] = [];
    for (let wireId of selectedWireIds.values()) {
        if (wires[wireId]) {
            wires[wireId].points.forEach((point, index) => {
                selectHandles.push({
                    wireId,
                    xy: point,
                    pointIndex: index as 0 | 1,
                });
            });
        }
    }
    return selectHandles;
});
