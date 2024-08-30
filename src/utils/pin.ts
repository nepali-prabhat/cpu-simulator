import { BoundingRect, Element } from "@/types";
import { getMergedPositionRect } from "./box";

// use this fn when pinUid might not be in the element
// Otherwise, getMergedPositionRect should be fine
export function getPinRectOfElement(
    element: Element,
    pinUid: string
): BoundingRect | undefined {
    const pin = element.io.pins.find((v) => v.uid === pinUid);
    if (pin) {
        const rect = getMergedPositionRect(element.rect, pin.rect);
        return rect;
    }
}
