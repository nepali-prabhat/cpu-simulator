import { PIN_HEIGHT, PIN_LENGTH } from "@/constants/constants";
import { elementsInfo } from "@/constants/elementsInfo";
import {
    Point,
    BoundingBox,
    BoundingRect,
    ElementConfig,
    ElementPins,
    PinLine,
    Element,
    ElementIntersectedRect,
} from "@/types";
import { makeTransformationMatrix, transformRect } from "@/utils/transform";
import { applyToPoints, compose, translate } from "transformation-matrix";
import { nanoid } from "nanoid";

export function getPointsOfBoundingBox(box: BoundingBox) {
    const p1 = { x: box.x, y: box.y };
    const p2 = { x: box.x, y: box.y + box.height };
    const p3 = { x: box.x + box.width, y: box.y + box.height };
    const p4 = { x: box.x + box.width, y: box.y };

    let tl: Point = p1;
    let bl: Point;
    let br: Point = p1;
    let tr: Point;

    for (let p of [p2, p3, p4]) {
        if (p.x <= tl.x && p.y <= tl.y) {
            tl = p;
        }
        if (p.x >= br.x && p.y >= br.y) {
            br = p;
        }
    }

    const height = br.y - tl.y;
    const width = br.x - tl.x;
    bl = { x: tl.x, y: tl.y + height };
    tr = { x: tl.x + width, y: tl.y };

    return {
        tl,
        bl,
        br,
        tr,
        height,
        width,
    };
}

/* export function isPointInsideBox(
    point: Point,
    box: BoundingBox,
) {
    const points = getPointsOfBoundingBox(box);
    const x = points.tl.x;
    const y = points.tl.y;
    const width = points.width;
    const height = points.height;
    return (
        point.x >= x &&
        point.x <= x + width &&
        point.y >= y &&
        point.y <= y + height
    );
} */

export function isPointInsideBox(point: Point, boundingBox?: BoundingBox) {
    if (boundingBox) {
        // if box has negative widths, recalculate box x, y coordinates
        let box: BoundingBox = { ...boundingBox };
        if (boundingBox.width < 0) {
            box = { ...box, x: box.x + box.width, width: Math.abs(box.width) };
        }
        if (boundingBox.height < 0) {
            box = {
                ...box,
                y: box.y + box.height,
                height: Math.abs(box.height),
            };
        }

        return (
            point.x >= box.x &&
            point.x <= box.x + box.width &&
            point.y >= box.y &&
            point.y <= box.y + box.height
        );
    }
    return false;
}

export function getRectFromDiagonals(
    d1: Point,
    d2: Point
): [number, number, number, number] {
    const rv = [d1.x, d1.y, d2.x - d1.x, d2.y - d1.y];
    let topRightPoint: Point = {
        x: d1.x + Math.min(0, rv[2]),
        y: d1.y + Math.min(0, rv[3]),
    };
    return [
        topRightPoint.x,
        topRightPoint.y,
        Math.abs(d2.x - d1.x),
        Math.abs(d2.y - d1.y),
    ];
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
                info.width + PIN_LENGTH,
                height / 2 - PIN_HEIGHT / 2,
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
    position = [0, 0],
}: {
    config: ElementConfig;
    position?: [number, number];
}) {
    const info = elementsInfo.get(config.type);
    const effectiveDimension = getEffectiveDimension(config);
    if (!info || !effectiveDimension) {
        return undefined;
    }
    const tm = makeTransformationMatrix({
        elementConfig: config,
        effectiveDimension,
    });
    const tmIcon = compose(
        tm,
        translate(PIN_LENGTH, effectiveDimension.height / 2 - info.height / 2)
    );
    const tranformedRect: BoundingRect = [
        ...position,
        ...((config.rotation === 90 || config.rotation === 270
            ? [effectiveDimension.height, effectiveDimension.width]
            : [effectiveDimension.width, effectiveDimension.height]
        ).map((n) => n * (config.scale || 1)) as [number, number]),
    ];

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
        rect: tranformedRect,
    };
}

export function getIntersectedRectOfElement(
    element: Element,
    point: [number, number]
) {
    let intersected: ElementIntersectedRect[] = [];
    const topLeft = element.rect;
    let i = 0;
    for (let pin of element.io.pins) {
        const [x, y, width, height] = pin.rect;
        const effectiveRect: BoundingRect = [
            topLeft[0] + x,
            topLeft[1] + y,
            width,
            height,
        ];
        if (
            effectiveRect[0] <= point[0] &&
            effectiveRect[0] + effectiveRect[2] >= point[0] &&
            effectiveRect[1] <= point[1] &&
            effectiveRect[1] + effectiveRect[3] >= point[1]
        ) {
            intersected.push({
                uid: pin.uid,
                pinIndex: pin.pinIndex,
                type: pin.type,
                rect: effectiveRect,
            });
        }
        i++;
    }
    return intersected;
}
