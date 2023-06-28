import { PIN_HEIGHT, PIN_LENGTH } from "@/constants/constants";
import { elementsInfo } from "@/constants/elementsInfo";
import {
    Point,
    BoundingBox,
    BoundingRect,
    ElementConfig,
    PinType,
} from "@/types";

export function getRectFromDiagonals(
    d1: Point,
    d2: Point
): [number, number, number, number] {
    return [d1.x, d1.y, d2.x - d1.x, d2.y - d1.y];
}

export function convertBoxToRect(boundingBox: BoundingBox): BoundingRect {
    const rect: BoundingRect = [
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height,
    ];
    return rect;
}

export function getEffectiveDimension({
    type,
    inputsCount = 1,
}: ElementConfig) {
    const info = elementsInfo.get(type);
    if (!info) {
        return;
    }
    const evenInputsCount = inputsCount - (inputsCount % 2);
    const effectiveInputPinsCount = evenInputsCount * 2;
    const effectivePinsHeight = effectiveInputPinsCount * PIN_HEIGHT;
    const padding = PIN_HEIGHT * 1;
    const height = Math.max(info.height, padding + effectivePinsHeight);
    let width = info.width + PIN_LENGTH * 2;
    return {
        width,
        height,
    };
}

export function getPinsBoundingBox(elementConfig: ElementConfig) {
    const rv: {
        pins: (BoundingBox & {
            type: PinType;
            negate?: boolean;
            pinIndex: number;
        })[];
        lines: { x: number; y: number; x1: number; y1: number }[];
    } = {
        pins: [],
        lines: [],
    };
    const info = elementsInfo.get(elementConfig.type);
    const effectiveDimension = getEffectiveDimension(elementConfig);
    if (!elementConfig || !info || !effectiveDimension) {
        return rv;
    }
    const { height } = effectiveDimension;
    // make output gate
    // TODO: add cases for mux, dex, flip flips, etc
    if (info.negateOutputPins?.includes(0)) {
        rv.pins.push({
            type: "output",
            negate: true,
            pinIndex: 0,
            x: info.width + PIN_LENGTH + PIN_HEIGHT / 2,
            y: height / 2 - PIN_HEIGHT / 2 + PIN_LENGTH / 2,
            width: PIN_LENGTH,
            height: PIN_HEIGHT,
        });
    } else {
        rv.pins.push({
            type: "output",
            pinIndex: 0,
            x: info.width + PIN_LENGTH,
            y: height / 2 - PIN_HEIGHT / 2,
            width: PIN_LENGTH,
            height: PIN_HEIGHT,
        });
    }
    const midPoint = height / 2;
    const numberOfPins = elementConfig.inputsCount || 1;
    let xOffset = 0;
    if (["or_gate", "nor_gate"].includes(elementConfig.type)) {
        xOffset = PIN_LENGTH;
    } else if (["xor_gate", "xnor_gate"].includes(elementConfig.type)) {
        xOffset = PIN_LENGTH/2;
    }

    // make input pins
    const edgePinCount = Math.floor(numberOfPins / 2);
    if (edgePinCount * 2 !== numberOfPins) {
        // middle pin
        rv.pins.push({
            type: "input",
            pinIndex: edgePinCount,
            x: xOffset,
            y: midPoint - PIN_HEIGHT / 2,
            width: PIN_LENGTH,
            height: PIN_HEIGHT,
        });
    }
    // edge pins
    for (let i = 1; i <= edgePinCount; i++) {
        // top pin
        rv.pins.push({
            type: "input",
            pinIndex: i - 1,
            x: i === 1 ? xOffset : 0,
            y: midPoint - PIN_HEIGHT * i * 2 - PIN_HEIGHT / 2,
            width: PIN_LENGTH,
            height: PIN_HEIGHT,
        });
        // bottom pin
        rv.pins.push({
            type: "input",
            pinIndex: edgePinCount + i - 1,
            x: i === 1 ? xOffset : 0,
            y: midPoint + PIN_HEIGHT * i * 2 - PIN_HEIGHT / 2,
            width: PIN_LENGTH,
            height: PIN_HEIGHT,
        });
        // top pin lines
        if (i !== 1) {
            rv.lines.push({
                x: PIN_LENGTH,
                y: midPoint - PIN_HEIGHT * i * 2 + PIN_HEIGHT / 2,

                x1: PIN_LENGTH,
                y1: midPoint - PIN_HEIGHT * i * 2 + PIN_HEIGHT*1.5 ,
            });
        }
        // bottom pin lines
        if (i !== edgePinCount) {
            rv.lines.push({
                x: PIN_LENGTH,
                y: midPoint + PIN_HEIGHT * i * 2 + PIN_HEIGHT / 2,

                x1: PIN_LENGTH,
                y1: midPoint + PIN_HEIGHT * i * 2 + PIN_HEIGHT * 2,
            });
        }
    }

    return rv;
}
