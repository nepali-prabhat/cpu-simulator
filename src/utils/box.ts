import { PIN_HEIGHT, PIN_LENGTH } from "@/constants/constants";
import { elementsInfo } from "@/constants/elementsInfo";
import {
    Point,
    BoundingBox,
    BoundingRect,
    ElementConfig,
    ElementPins,
    PinLine,
} from "@/types";
import { makeTransformationMatrix, transformRect } from "@/utils/transform";
import { applyToPoints, compose, translate } from "transformation-matrix";
import { nanoid } from "nanoid";

export function getRectFromDiagonals(
    d1: Point,
    d2: Point
): [number, number, number, number] {
    return [d1.x, d1.y, d2.x - d1.x, d2.y - d1.y];
}

export function convertRectToBox(rect: BoundingRect): BoundingBox {
    return { x: rect[0], y: rect[1], width: rect[2], height: rect[3] };
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
    const rv: ElementPins = {
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
            uid: nanoid(),
            type: "output",
            negate: true,
            pinIndex: 0,
            rect: [
                info.width + PIN_LENGTH + PIN_HEIGHT / 2,
                height / 2 - PIN_HEIGHT / 2 + PIN_LENGTH / 2,
                PIN_LENGTH,
                PIN_HEIGHT,
            ],
        });
    } else {
        rv.pins.push({
            uid: nanoid(),
            type: "output",
            pinIndex: 0,
            rect: [
                info.width + PIN_LENGTH,
                height / 2 - PIN_HEIGHT / 2,
                PIN_LENGTH,
                PIN_HEIGHT,
            ],
        });
    }
    const midPoint = height / 2;
    const numberOfPins = elementConfig.inputsCount || 1;
    let xOffset = 0;
    if (["or_gate", "nor_gate"].includes(elementConfig.type)) {
        xOffset = PIN_LENGTH;
    } else if (["xor_gate", "xnor_gate"].includes(elementConfig.type)) {
        xOffset = PIN_LENGTH / 2;
    }

    // make input pins
    const edgePinCount = Math.floor(numberOfPins / 2);
    if (edgePinCount * 2 !== numberOfPins) {
        // middle pin
        rv.pins.push({
            uid: nanoid(),
            type: "input",
            pinIndex: edgePinCount,
            rect: [xOffset, midPoint - PIN_HEIGHT / 2, PIN_LENGTH, PIN_HEIGHT],
        });
    }
    // edge pins
    for (let i = 1; i <= edgePinCount; i++) {
        // top pin
        rv.pins.push({
            uid: nanoid(),
            type: "input",
            pinIndex: i - 1,
            rect: [
                i === 1 ? xOffset : 0,
                midPoint - PIN_HEIGHT * i * 2 - PIN_HEIGHT / 2,
                PIN_LENGTH,
                PIN_HEIGHT,
            ],
        });
        // bottom pin
        rv.pins.push({
            uid: nanoid(),
            type: "input",
            pinIndex: edgePinCount + i - 1,
            rect: [
                i === 1 ? xOffset : 0,
                midPoint + PIN_HEIGHT * i * 2 - PIN_HEIGHT / 2,
                PIN_LENGTH,
                PIN_HEIGHT,
            ],
        });
        // top pin lines
        if (i !== 1) {
            rv.lines.push([
                PIN_LENGTH,
                midPoint - PIN_HEIGHT * i * 2 + PIN_HEIGHT / 2,

                PIN_LENGTH,
                midPoint - PIN_HEIGHT * i * 2 + PIN_HEIGHT * 1.5,
            ]);
        }
        // bottom pin lines
        if (i !== edgePinCount) {
            rv.lines.push([
                PIN_LENGTH,
                midPoint + PIN_HEIGHT * i * 2 + PIN_HEIGHT / 2,
                PIN_LENGTH,
                midPoint + PIN_HEIGHT * i * 2 + PIN_HEIGHT * 2,
            ]);
        }
    }

    return rv;
}

export function getElementRects({
    config,
    position,
}: {
    config: ElementConfig;
    position?: Point;
}) {
    const info = elementsInfo.get(config.type);
    const effectiveDimension = getEffectiveDimension(config);
    if (!info || !effectiveDimension) {
        return undefined;
    }
    const tm = makeTransformationMatrix({
        elementConfig: config,
        position,
        effectiveDimension,
    });
    const tmIcon = compose(
        tm,
        translate(PIN_LENGTH, effectiveDimension.height / 2 - info.height / 2)
    );
    const transformedDimension = transformRect({
        tm,
        rect: [0, 0, effectiveDimension.width, effectiveDimension.height],
    });

    const { pins, lines } = getPinsBoundingBox(config);
    const transformedPins = pins.map((pin) => ({
        ...pin,
        rect: transformRect({ tm, rect: pin.rect }),
    }));
    const transformedLines: PinLine[] = lines.map((line) => {
        const [p1, p2] = applyToPoints(tm, [
            {
                x: line[0],
                y: line[1],
            },
            {
                x: line[2],
                y: line[3],
            },
        ]);
        return [p1.x, p1.y, p2.x, p2.y];
    });

    const iconBoundingRect = transformRect({
        tm: tmIcon,
        rect: [0, 0, info.width, info.height],
    });

    const io: ElementPins = { pins: transformedPins, lines: transformedLines };

    return {
        tmIcon,
        iconRect: iconBoundingRect,
        io,
        rect: transformedDimension,
    };
}
