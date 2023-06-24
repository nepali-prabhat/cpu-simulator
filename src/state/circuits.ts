import { Circuit } from "@/types";
import { PrimitiveAtom, atom } from "jotai";
import { nanoid } from "nanoid";

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
