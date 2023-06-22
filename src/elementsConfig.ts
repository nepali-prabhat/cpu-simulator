import { ElementConfig, ElementType } from "./types";

const element64x64 = { height: 64, width: 64 };
export const elementsConfig: Map<ElementType, ElementConfig> = new Map();
elementsConfig.set("and_gate", {
    ...element64x64,
    displayName: "And Gate",
});
elementsConfig.set("or_gate", {
    ...element64x64,
    displayName: "Or Gate",
});
elementsConfig.set("not_gate", {
    ...element64x64,
    displayName: "Not Gate",
});

export const elementNameMap: Map<ElementType, string> = new Map();
elementNameMap.set("and_gate", "AND Gate");
elementNameMap.set("or_gate", "OR Gate");
elementNameMap.set("not_gate", "NOT Gate");
elementNameMap.set("nand_gate", "NAND Gate");
elementNameMap.set("nor_gate", "NOR Gate");
elementNameMap.set("buffer", "Buffer");
elementNameMap.set("xor_gate", "XOR Gate");
elementNameMap.set("xnor_gate", "XNOR Gate");
elementNameMap.set("mux", "Multiplexer");
elementNameMap.set("dmux", "Demultiplexer");
elementNameMap.set("decoder", "Decoder");
elementNameMap.set("DQ_flip_flop", "DQ Flip Flop");
elementNameMap.set("JK_flip_flop", "JK Flip Flop");
