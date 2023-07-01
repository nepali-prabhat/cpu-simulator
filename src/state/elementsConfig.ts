import { ELEMENTS_COLOR_PALETTE } from "@/colors";
import { ElementConfig, ElementType } from "@/types";
import { PrimitiveAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

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
    atomWithStorage<ElementConfig>("and_gate_defaults", {
        type: "and_gate",
        inputsCount: 2,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "or_gate",
    atomWithStorage<ElementConfig>("or_gate_defaults", {
        type: "or_gate",
        inputsCount: 2,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "not_gate",
    atomWithStorage<ElementConfig>("not_gate_defaults", {
        type: "not_gate",
        dataBits: 1,
        ...uiValues,
    })
);

elementsConfigAtomsMap.set(
    "buffer",
    atomWithStorage<ElementConfig>("buffer_defaults", {
        type: "buffer",
        inputsCount: 1,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "nand_gate",
    atomWithStorage<ElementConfig>("nand_gate_defaults", {
        type: "nand_gate",
        inputsCount: 2,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "nor_gate",
    atomWithStorage<ElementConfig>("nor_gate_defaults", {
        type: "nor_gate",
        inputsCount: 2,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "xor_gate",
    atomWithStorage<ElementConfig>("xor_gate_defaults", {
        type: "xor_gate",
        inputsCount: 2,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "xnor_gate",
    atomWithStorage<ElementConfig>("xnor_gate_defaults", {
        type: "xnor_gate",
        inputsCount: 2,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "mux",
    atomWithStorage<ElementConfig>("mux_defaults", {
        type: "mux",
        selectBits: 1,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "dmux",
    atomWithStorage<ElementConfig>("dmux_defaults", {
        type: "dmux",
        selectBits: 1,
        dataBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "decoder",
    atomWithStorage<ElementConfig>("decoder_defaults", {
        type: "decoder",
        selectBits: 1,
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "DQ_flip_flop",
    atomWithStorage<ElementConfig>("DQ_Flip_Flop_defaults", {
        type: "DQ_flip_flop",
        ...uiValues,
    })
);
elementsConfigAtomsMap.set(
    "JK_flip_flop",
    atomWithStorage<ElementConfig>("JK_Flip_Flop_defaults", {
        type: "JK_flip_flop",
        ...uiValues,
    })
);
