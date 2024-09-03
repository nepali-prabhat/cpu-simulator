import { WireHighlights, Element, Wire, WireHandle, ElementPin, Point } from "@/types";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { selectedWireIdsAtom } from "./ui";
import { elementsAtom } from "./elements";
import { convertRectToBox, getMergedPositionRect, isPointInsideBox } from "@/utils/box";
import { lengthSquared, projectPointToSegment } from "@/utils";

export const wiresAtom = atomWithStorage<{ [key: Wire["uid"]]: Wire }>("wires", {});
wiresAtom.debugLabel = "wires atom";

export const highlightedWireIdsAtom = atom<WireHighlights>([]);

export const addWireAtom = atom(null, (_, set, value: Wire) => {
    set(wiresAtom, (v) => ({
        ...v,
        [value.uid]: value,
    }));
});

export const updateWireAtom = atom(null, (get, set, value: { uid: string; updater: (v: Wire) => Partial<Wire> }) => {
    const wires = get(wiresAtom);
    let elements = { ...get(elementsAtom) };
    const currentValue = wires[value.uid];
    let values = { ...currentValue, ...value.updater(currentValue) };

    const p1 = values.points[0];
    const p2 = values.points[1];

    // NOTE: Validate that all touching wireIds are actually touching
    // TODO: refactor: efficient + readable
    let touchingWireIds = values.touchingWireIds || [];
    touchingWireIds = touchingWireIds.filter((wireId) => {
        const wirePoints = wires[wireId].points;
        if (wirePoints) {
            const checkPointLength = (point: Point) =>
                lengthSquared(projectPointToSegment(point, wirePoints[0], wirePoints[1]), point) == 0;
            return checkPointLength(p1) || checkPointLength(p2);
        }
        return false;
    });

    let touchingPinIds = values.touchingPinIds || [];

    // NOTE: Validate that "touchingPinIds" are actually touching
    // TODO: refactor: efficient + readable
    touchingPinIds = touchingPinIds.filter((pinId) => {
        let pin: ElementPin | undefined;
        let element: Element | undefined;
        loop1: for (let e of Object.values(elements)) {
            for (let p of e.io.pins) {
                if (p.uid === pinId) {
                    pin = p;
                    element = e;
                    break loop1;
                }
            }
        }
        if (!pin || !element) {
            return false;
        }
        const pinBox = convertRectToBox(getMergedPositionRect(element.rect, pin.rect));
        const isPinInBox = isPointInsideBox(p1, pinBox) || isPointInsideBox(p2, pinBox);
        return isPinInBox;
    });

    values = { ...values, touchingPinIds, touchingWireIds };
    set(wiresAtom, {
        ...wires,
        [value.uid]: values,
    });
});

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
