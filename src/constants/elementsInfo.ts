import { ElementInfo, ElementType } from "@/types";

const element64x64 = { height: 64, width: 64 };

export const maxBitsSupported = 32;
export const maxSelectBits = Math.sqrt(maxBitsSupported);

export const elementsInfo: Map<ElementType, ElementInfo> = new Map();
elementsInfo.set("and_gate", {
    height: 64,
    width: 45,
    displayName: "And Gate",
});
elementsInfo.set("or_gate", {
    ...element64x64,
    displayName: "Or Gate",
});
elementsInfo.set("not_gate", {
    ...element64x64,
    displayName: "Not Gate",
});
elementsInfo.set("nand_gate", {
    ...element64x64,
    displayName: "NAND Gate",
});
elementsInfo.set("nor_gate", {
    ...element64x64,
    displayName: "NOR Gate",
});
elementsInfo.set("buffer", {
    ...element64x64,
    displayName: "Buffer",
});
elementsInfo.set("xor_gate", {
    ...element64x64,
    displayName: "XOR Gate",
});
elementsInfo.set("xnor_gate", {
    ...element64x64,
    displayName: "XNOR Gate",
});
elementsInfo.set("mux", {
    ...element64x64,
    displayName: "Multiplexer",
});
elementsInfo.set("dmux", {
    ...element64x64,
    displayName: "Demultiplexer",
});
elementsInfo.set("decoder", {
    ...element64x64,
    displayName: "Decoder",
});
elementsInfo.set("DQ_flip_flop", {
    ...element64x64,
    displayName: "DQ Flip Flop",
});
elementsInfo.set("JK_flip_flop", {
    ...element64x64,
    displayName: "JK Flip Flop",
});
