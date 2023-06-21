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
