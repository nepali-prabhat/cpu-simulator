import { Element, BoundingBox, Circuit, ElementType } from "@/types";
import { PrimitiveAtom, atom } from "jotai";
import { nanoid } from "nanoid";

const ids = [
    nanoid(),
    nanoid(),
    nanoid(),
    nanoid(),
    nanoid(),
    nanoid(),
    nanoid(),
    nanoid(),
    nanoid(),
    nanoid(),
    nanoid(),
    nanoid(),
    nanoid(),
];

export const elementsAtom = atom<{ [key: Element["uid"]]: Element }>({
    [ids[0]]: {
        uid: ids[0],
        x: 0,
        y: 0,
        width: 64,
        height: 64,
        type: "and_gate",
        zIndex: 0,
        nonce: 0,
    },
    [ids[1]]: {
        uid: ids[1],
        x: 64,
        y: 64,
        width: 64,
        height: 64,
        type: "or_gate",
        zIndex: 0,
        nonce: 10,
    },
    [ids[2]]: {
        uid: ids[2],
        x: 128,
        y: 128,
        width: 64,
        height: 64,
        type: "not_gate",
        zIndex: 0,
        nonce: 20,
    },
    [ids[3]]: {
        uid: ids[3],
        x: 64,
        y: 0,
        width: 64,
        height: 64,
        type: "nand_gate",
        zIndex: 0,
        nonce: 23,
    },
    [ids[4]]: {
        uid: ids[4],
        x: 0,
        y: 64,
        width: 64,
        height: 64,
        type: "nor_gate",
        zIndex: 0,
        nonce: 23,
    },
    [ids[5]]: {
        uid: ids[5],
        x: 0,
        y: 128,
        width: 64,
        height: 64,
        type: "buffer",
        zIndex: 0,
        nonce: 23,
    },
    [ids[6]]: {
        uid: ids[6],
        x: 128,
        y: 64,
        width: 64,
        height: 64,
        type: "xor_gate",
        zIndex: 0,
        nonce: 23,
    },
    [ids[7]]: {
        uid: ids[7],
        x: 128,
        y: 0,
        width: 64,
        height: 64,
        type: "xnor_gate",
        zIndex: 0,
        nonce: 23,
    },
    [ids[8]]: {
        uid: ids[8],
        x: 0,
        y: 192,
        width: 64,
        height: 64,
        type: "mux",
        zIndex: 0,
        nonce: 23,
    },
    [ids[9]]: {
        uid: ids[9],
        x: 64,
        y: 192,
        width: 64,
        height: 64,
        type: "dmux",
        zIndex: 0,
        nonce: 23,
    },
    [ids[10]]: {
        uid: ids[10],
        x: 128,
        y: 192,
        width: 64,
        height: 64,
        type: "decoder",
        zIndex: 0,
        nonce: 23,
    },
    [ids[11]]: {
        uid: ids[11],
        x: 192,
        y: 256,
        width: 64,
        height: 64,
        type: "DQ_flip_flop",
        zIndex: 0,
        nonce: 23,
    },
});
export const selectedElementIdsAtom = atom<Set<Element["uid"]>>(
    new Set<Element["uid"]>()
);
export const selectRectAtom = atom<BoundingBox | undefined>(undefined);

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

export const activeElementTypeAtom = atom<ElementType | undefined>(undefined);

export const appStateAtom = atom((get) => {
    return {
        elements: get(elementsAtom),
        selectedElementIds: get(selectedElementIdsAtom),
        selectRect: get(selectRectAtom),
        activeElementType: get(activeElementTypeAtom),
    };
});
