import { GRID_SPACE } from "@/constants";
import { Element, BoundingBox, Circuit } from "@/types";
import { PrimitiveAtom, atom, getDefaultStore } from "jotai";
import { splitAtom } from "jotai/utils";
import { nanoid } from "nanoid";

const gridSpace = GRID_SPACE;
const ids = [nanoid(), nanoid(), nanoid()];

export const elementsAtom = atom<{ [key: Element["uid"]]: Element }>({
    [ids[0]]: {
        uid: ids[0],
        x: gridSpace * 6,
        y: gridSpace * 4,
        width: 60,
        height: 60,
        type: "and_gate",
        zIndex: 0,
        nonce: 0,
    },
    [ids[1]]: {
        uid: ids[1],
        x: gridSpace + gridSpace * 10,
        y: gridSpace + gridSpace * 5,
        width: 60,
        height: 60,
        type: "or_gate",
        zIndex: 0,
        nonce: 1,
    },
    [ids[2]]: {
        uid: ids[2],
        x: gridSpace * 3,
        y: gridSpace * 9,
        width: 60,
        height: 60,
        type: "not_gate",
        zIndex: 0,
        nonce: 2,
    },
});
export const selectedElementIdsAtom = atom<Set<Element["uid"]>>(
    new Set<Element["uid"]>()
);
export const selectRectAtom = atom<BoundingBox | undefined>(undefined);

export const appStateAtom = atom((get) => {
    const elements = get(elementsAtom);
    const selectedElementIds = get(selectedElementIdsAtom);
    const selectRect = get(selectRectAtom);
    return {
        elements,
        selectedElementIds,
        selectRect,
    };
});

const tempId = nanoid();
export const circuitsAtom = atom<PrimitiveAtom<Circuit>[]>([
    atom({
        uid: tempId,
        title: "main",
    }),
]);
export const selectedCircuitIdAtom = atom<Circuit["uid"] | undefined>(tempId);
circuitsAtom.debugLabel = "circuitsAtom";
selectedCircuitIdAtom.debugLabel = "selectedCircuitUidAtom";

export const editableCircuitAtom = atom(
    (get) => {
        const selectedCircuitId = get(selectedCircuitIdAtom);
        if (!selectedCircuitId) {
            return;
        }
        const circuits = get(circuitsAtom);
        const selectedCircuitAtom = circuits.find(
            (c) => get(c).uid === selectedCircuitId
        );
        return selectedCircuitAtom ? get(selectedCircuitAtom) : undefined;
    },
    (get, set, _value: Partial<Circuit>) => {
        const selectedCircuitId = get(selectedCircuitIdAtom);
        const circuits = get(circuitsAtom);
        if (selectedCircuitId) {
            const selectedCircuitAtom = circuits.find(
                (c) => get(c).uid === selectedCircuitId
            );
            if (selectedCircuitAtom) {
                set(selectedCircuitAtom, {
                    ...get(selectedCircuitAtom),
                    ..._value,
                });
            }
        }
        if (!selectedCircuitId && !!_value.title) {
            // create a new circuit
            const uid = nanoid();
            const newCircuit = atom<Circuit>({
                uid,
                title: "",
                ..._value,
            });
            set(circuitsAtom, [...circuits, newCircuit]);
            set(selectedCircuitIdAtom, uid);
        }
    }
);

export const removeCircuitAtom = atom(null, (get, set, removedCircuitId) => {
    const ca = get(circuitsAtom);
    const selectedCircuitId = get(selectedCircuitIdAtom);

    let removedIndex: number | undefined;
    const newCircuits = ca.filter((v, index) => {
        if (get(v).uid === removedCircuitId) {
            removedIndex = index;
            return false;
        }
        return true;
    });

    const nextSelectedCircuitId =
        removedIndex !== undefined &&
            (ca[removedIndex + 1] || ca[removedIndex - 1])
            ? get(ca[removedIndex + 1] || ca[removedIndex - 1]).uid
            : undefined;

    if (removedCircuitId === selectedCircuitId) {
        set(selectedCircuitIdAtom, nextSelectedCircuitId);
    }
    set(circuitsAtom, newCircuits);
});

export const newCircuitTitleAtom = atom<string>("");
export const addNewCircuitAtom = atom(
    null,
    (get, set, _value: Partial<Circuit>) => {
        const circuits = get(circuitsAtom);
        const uid = _value.uid || nanoid();
        const newCircuit: Circuit = {
            uid,
            title: _value.title || "",
            description: _value.description || "",
        };
        set(circuitsAtom, [...circuits, atom(newCircuit)]);
        if (circuits.length === 0) {
            set(selectedCircuitIdAtom, uid);
        }
    }
);
