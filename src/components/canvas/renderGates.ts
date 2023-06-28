import { applyToPoints, translate, compose } from "transformation-matrix";

import { COLOR_PALETTE } from "@/colors";
import { DEBUG_BOUNDING_BOX, PIN_LENGTH } from "@/constants/constants";
import { elementsInfo } from "@/constants/elementsInfo";
import {
    BoundingRect,
    CanvasProperties,
    Element,
    ElementConfig,
    ElementInfo,
    GhostElement,
} from "@/types";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Options } from "roughjs/bin/core";
import {
    convertBoxToRect,
    getEffectiveDimension,
    getPinsBoundingBox,
} from "@/utils/box";
import { makeTransformationMatrix, transformRect } from "@/utils/transform";

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

    const elementConfig = element.elementConfig;

    // Transformation matrices
    drawGate({
        elementConfig,
        rc,
        context,
        seed: element.seed,
        bgColor: canvasProperties.bgColor,
    });
}

function drawGate({
    elementConfig,
    rc,
    context,
    seed,
    bgColor = "#fff",
}: {
    elementConfig: ElementConfig;
    rc: RoughCanvas;
    context: CanvasRenderingContext2D;
    seed: number;
    bgColor?: string;
}) {
    seed += 1;
    const roughness = 0.2;
    const hachureGap = 4;
    const elementColor = elementConfig.color || "#000";
    const debugConfig = {
        seed,
        roughness,
        fill: undefined,
        stroke: COLOR_PALETTE.blue[1],
    };

    const info = elementsInfo.get(elementConfig.type);
    const effectiveDimension = getEffectiveDimension(elementConfig);
    if (!info || !effectiveDimension) {
        return;
    }

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
            noFillPathIndex: info.noFillPathIndex,
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

    if (DEBUG_BOUNDING_BOX) {
        const rects: BoundingRect[] = [transformedDimension, iconBoundingRect];
        rects.forEach((rect) => {
            rc.rectangle(...rect, debugConfig);
        });
    }
}

function renderGateIcon({
    rc,
    paths,
    noFillPathIndex,
    config,
}: {
    rc: RoughCanvas;
    paths: string | string[];
    noFillPathIndex?: number[];
    config: {
        bgConfig: Options;
        fgConfig: Options;
    };
}) {
    if (Array.isArray(paths)) {
        paths.forEach((path, i) => {
            if (noFillPathIndex && noFillPathIndex.includes(i)) {
                rc.path(path, { ...config.fgConfig, fill: undefined });
            } else {
                rc.path(path, config.bgConfig);
                rc.path(path, config.fgConfig);
            }
        });
    } else {
        rc.path(paths, config.bgConfig);
        rc.path(paths, config.fgConfig);
    }
}
