import { ELEMENTS_COLOR_PALETTE } from "@/colors";
import { ElementConfig, ElementType } from "@/types";
import { PrimitiveAtom, atom } from "jotai";

export const elementsConfigAtomsMap: Map<
    ElementType,
    PrimitiveAtom<ElementConfig>
> = new Map();

const color = ELEMENTS_COLOR_PALETTE[0];

const uiValues = {
    rotation: 0,
    scale: 1,
    color,
};
elementsConfigAtomsMap.set(
    "and_gate",
    atom<ElementConfig>({
        type: "and_gate",
        inputsCount: 2,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "or_gate",
    atom<ElementConfig>({
        type: "or_gate",
        inputsCount: 2,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "not_gate",
    atom<ElementConfig>({
        type: "not_gate",
        dataBits: 1,
        ...uiValues,
    })
);

elementsConfigAtomsMap.set(
    "buffer",
    atom<ElementConfig>({
        type: "buffer",
        inputsCount: 1,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "nand_gate",
    atom<ElementConfig>({
        type: "nand_gate",
        inputsCount: 2,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "nor_gate",
    atom<ElementConfig>({
        type: "nor_gate",
        inputsCount: 2,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "xor_gate",
    atom<ElementConfig>({
        type: "xor_gate",
        inputsCount: 2,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "xnor_gate",
    atom<ElementConfig>({
        type: "xnor_gate",
        inputsCount: 2,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "mux",
    atom<ElementConfig>({
        type: "mux",
        selectBits: 1,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "dmux",
    atom<ElementConfig>({
        type: "dmux",
        selectBits: 1,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "decoder",
    atom<ElementConfig>({
        type: "decoder",
        selectBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "DQ_flip_flop",
    atom<ElementConfig>({
        type: "DQ_flip_flop",
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "JK_flip_flop",
    atom<ElementConfig>({
        type: "JK_flip_flop",
        ...uiValues,
    })
);
