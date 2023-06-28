import { ElementInfo, ElementType } from "@/types";

const element48x48 = { height: 48, width: 48 };

export const maxBitsSupported = 32;
export const maxSelectBits = Math.sqrt(maxBitsSupported);

export const elementsInfo: Map<ElementType, ElementInfo> = new Map();
elementsInfo.set("and_gate", {
    height: 48,
    // width: 33.75,
    width: 34,
    path: "M31.75 24C31.75 36.4018 23.7288 46 11.9118 46H4C2.89543 46 2 45.1046 2 44V4C2 2.89543 2.89543 2 4 2H11.9118C23.7288 2 31.75 11.5982 31.75 24Z",
    displayName: "And Gate",
});
elementsInfo.set("or_gate", {
    height: 49.17,
    // width: 37.62,
    width: 39,
    path: "M2.88766 45.7536C6.03303 41.487 9.34243 34.6259 9.34243 24.7265C9.34243 14.6244 5.8964 7.61393 2.70503 3.30484C2.69426 3.2903 2.64623 3.21368 2.64053 3.03033C2.63475 2.84431 2.67731 2.61733 2.77326 2.40291C2.87072 2.18511 2.98654 2.06033 3.05319 2.01019C3.05675 2.00751 3.05993 2.00519 3.06274 2.0032C6.61233 2.29911 10.766 2.78219 13.8692 3.53795C21.7304 5.45253 33.1082 11.2931 36.2141 24.3702C36.2691 24.6017 36.269 24.8513 36.214 25.0827C33.1132 38.129 21.7623 43.7292 13.8692 45.6516C10.8315 46.3914 6.7855 46.8702 3.28297 47.1678C3.27928 47.1651 3.27503 47.162 3.2702 47.1583C3.19541 47.1011 3.07039 46.963 2.96563 46.727C2.86257 46.4949 2.81607 46.2493 2.82146 46.0477C2.82683 45.8473 2.87874 45.7657 2.88766 45.7536Z",
    displayName: "Or Gate",
});
elementsInfo.set("not_gate", {
    height: 43,
    width: 34,
    path: "M30.7602 22.9461L5.1177 40.2269C3.78928 41.1222 2 40.1703 2 38.5684V4.00678C2 2.40486 3.78929 1.45301 5.11771 2.34825L30.7602 19.6291C31.9366 20.4218 31.9366 22.1533 30.7602 22.9461Z",
    negateOutputPins: [0],
    displayName: "Not Gate",
});
elementsInfo.set("nand_gate", {
    ...element48x48,
    displayName: "NAND Gate",
});
elementsInfo.set("nor_gate", {
    ...element48x48,
    displayName: "NOR Gate",
});
elementsInfo.set("buffer", {
    ...element48x48,
    displayName: "Buffer",
});
elementsInfo.set("xor_gate", {
    ...element48x48,
    displayName: "XOR Gate",
});
elementsInfo.set("xnor_gate", {
    ...element48x48,
    displayName: "XNOR Gate",
});
elementsInfo.set("mux", {
    ...element48x48,
    displayName: "Multiplexer",
});
elementsInfo.set("dmux", {
    ...element48x48,
    displayName: "Demultiplexer",
});
elementsInfo.set("decoder", {
    ...element48x48,
    displayName: "Decoder",
});
elementsInfo.set("DQ_flip_flop", {
    ...element48x48,
    displayName: "DQ Flip Flop",
});
elementsInfo.set("JK_flip_flop", {
    ...element48x48,
    displayName: "JK Flip Flop",
});
