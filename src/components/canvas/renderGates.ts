import {
    applyToPoints,
    rotate,
    translate,
    compose,
    Matrix,
} from "transformation-matrix";

import { COLOR_PALETTE } from "@/colors";
import {
    DEBUG_BOUNDING_BOX,
    PIN_HEIGHT,
    PIN_LENGTH,
} from "@/constants/constants";
import { elementsInfo } from "@/constants/elementsInfo";
import {
    BoundingBox,
    BoundingRect,
    CanvasProperties,
    Dimension,
    Element,
    ElementConfig,
    GhostElement,
    PinType,
} from "@/types";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Options } from "roughjs/bin/core";
import {
    convertBoxToRect,
    getRectangleFromDiagonals as getRectFromDiagonals,
} from "@/utils";

export function renderGate({
    element,
    context,
    rc,
}: {
    element: Pick<Element, "nonce" | "type">;
    context: CanvasRenderingContext2D;
    rc: RoughCanvas | null;
}) { }

export function renderGhostGate({
    element,
    canvasProperties,
    context,
    rc,
}: {
    element: GhostElement;
    canvasProperties: CanvasProperties;
    context: CanvasRenderingContext2D;
    rc: RoughCanvas | null;
}) {
    if (!element?.show || !rc) {
        return;
    }
    const seed = element.seed + 1;
    const roughness = 0.2;
    const hachureGap = 4;
    const bgColor = canvasProperties.bgColor || "#fff";
    const elementColor = element.elementConfig.color || "#000";
    const debugConfig = {
        seed,
        roughness,
        fill: undefined,
        stroke: COLOR_PALETTE.blue[1],
    };

    const elementConfig = element.elementConfig;
    const info = elementsInfo.get(elementConfig.type);
    const effectiveDimension = getEffectiveDimension(elementConfig);
    if (!info || !effectiveDimension) {
        return;
    }

    // Transformation matrices
    const tm = makeTransformationMatrix({
        elementConfig,
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

    const { pins, lines } = getPinsBoundingBox(elementConfig);
    const transformedPins = pins.map((pin) => ({
        rect: transformRect({ tm, rect: convertBoxToRect(pin) }),
        originalPin: pin,
    }));

    const gateIconRect: BoundingRect = [0, 0, info.width, info.height];
    const iconBoundingRect = transformRect({
        tm: tmIcon,
        rect: gateIconRect,
    });

    const pinsConfig = {
        seed,
        roughness,
        bowing: 20,
        fill: bgColor,
        fillStyle: "solid",
        stroke: elementColor,
    };
    // render input and outputs
    for (let pin of transformedPins) {
        if (pin.originalPin.negate) {
            const rect = pin.rect;
            rc.circle(rect[0], rect[1], rect[3], pinsConfig);
        } else {
            rc.rectangle(...pin.rect, pinsConfig);
        }
    }

    for (let line of lines) {
        const [p1, p2] = applyToPoints(tm, [
            {
                x: line.x,
                y: line.y,
            },
            {
                x: line.x1,
                y: line.y1,
            },
        ]);
        rc.line(p1.x, p1.y, p2.x, p2.y, pinsConfig);
    }

    const gateConfig = {
        bgConfig: {
            seed,
            roughness,
            fill: bgColor,
            fillStyle: "solid",
            stroke: elementColor,
        },
        fgConfig: {
            seed,
            roughness,
            fill: elementColor,
            fillStyle: "hachure",
            hachureGap,
            stroke: elementColor,
        },
    };
    if (info.path) {
        context.save();
        context.transform(
            tmIcon.a,
            tmIcon.b,
            tmIcon.c,
            tmIcon.d,
            tmIcon.e,
            tmIcon.f
        );
        renderGateIcon({
            rc,
            paths: info.path,
            config: gateConfig,
        });
        context.restore();
    } else {
        rc.rectangle(...iconBoundingRect, {
            seed,
            roughness,
            fill: bgColor,
            fillStyle: "solid",
            stroke: elementColor,
            strokeWidth: 1,
        });
        context.fillText(
            elementConfig.type,
            iconBoundingRect[0],
            iconBoundingRect[1]
        );
    }

    if (DEBUG_BOUNDING_BOX) {
        const rects: BoundingRect[] = [
            transformedDimension,
            // iconBoundingRect
        ];
        rects.forEach((rect) => {
            rc.rectangle(...rect, debugConfig);
        });
    }
}

function renderGateIcon({
    rc,
    paths,
    config,
}: {
    rc: RoughCanvas;
    paths: string | string[];
    config: {
        bgConfig: Options;
        fgConfig: Options;
    };
}) {
    if (Array.isArray(paths)) {
        paths.forEach((path) => {
            rc.path(path, config.bgConfig);
            rc.path(path, config.fgConfig);
        });
    } else {
        rc.path(paths, config.bgConfig);
        rc.path(paths, config.fgConfig);
    }
}

function makeTransformationMatrix({
    elementConfig,
    effectiveDimension,
}: {
    elementConfig: ElementConfig;
    effectiveDimension: Dimension;
}): Matrix {
    const { width, height } = effectiveDimension;
    let tm: Matrix = compose(rotate(0));
    if (elementConfig.rotation === 180) {
        tm = compose(rotate(Math.PI), translate(-width, -height));
    }
    if (elementConfig.rotation === 90) {
        tm = compose(rotate(Math.PI / 2), translate(0, -height));
    }
    if (elementConfig.rotation === 270) {
        tm = compose(rotate(Math.PI * (3 / 2)), translate(-width, 0));
    }
    return tm;
}

function transformRect({
    tm,
    rect,
}: {
    tm: Matrix;
    rect: BoundingRect;
}): BoundingRect {
    const [d1, d2] = applyToPoints(tm, [
        { x: rect[0], y: rect[1] },
        { x: rect[0] + rect[2], y: rect[1] + rect[3] },
    ]);
    return getRectFromDiagonals(d1, d2);
}

function getEffectiveDimension({ type, inputsCount = 1 }: ElementConfig) {
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

function getPinsBoundingBox(elementConfig: ElementConfig) {
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
    if (!elementConfig || !info) {
        return rv;
    }
    const effectiveDimension = getEffectiveDimension(elementConfig);
    if (!effectiveDimension) {
        return rv;
    }
    const { height } = effectiveDimension;
    // make output gate
    switch (elementConfig.type) {
        default: {
            // TODO: make this dynamic
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
            break;
        }
    }
    const midPoint = height / 2;
    const numberOfPins = elementConfig.inputsCount || 1;
    // make input gate
    switch (elementConfig.type) {
        default: {
            const edgePinCount = Math.floor(numberOfPins / 2);
            if (edgePinCount * 2 !== numberOfPins) {
                // middle pin
                rv.pins.push({
                    type: "input",
                    pinIndex: edgePinCount,
                    x: 0,
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
                    x: 0,
                    y: midPoint - PIN_HEIGHT * i * 2 - PIN_HEIGHT / 2,
                    width: PIN_LENGTH,
                    height: PIN_HEIGHT,
                });
                // bottom pin
                rv.pins.push({
                    type: "input",
                    pinIndex: edgePinCount + i - 1,
                    x: 0,
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
                        y1: midPoint - PIN_HEIGHT * i * 2 + PIN_HEIGHT * 2,
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

            break;
        }
    }
    return rv;
}
