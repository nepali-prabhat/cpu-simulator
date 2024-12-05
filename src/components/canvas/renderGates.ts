import {
    COLOR_PALETTE,
    GHOST_ELEMENT_COLOR,
} from "@/colors";
import { DEBUG_BOUNDING_BOX } from "@/constants/constants";
import { elementsInfo } from "@/constants/elementsInfo";
import {
    BoundingRect,
    CanvasProperties,
    ElementPin,
    GhostElement as RenderableElement,
} from "@/types";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Options } from "roughjs/bin/core";

export function renderElement({
    element,
    pinHighlights,

    canvasProperties,
    context,
    rc,

    isGhostElement,
}: {
    element: RenderableElement;
    pinHighlights: ElementPin["uid"][];
    canvasProperties: CanvasProperties;
    context: CanvasRenderingContext2D;
    rc: RoughCanvas | null;
    isGhostElement?: boolean;
}) {
    if (rc) {
        // Transformation matrices
        drawGate({
            element,
            isGhostElement,
            pinHighlights,
            rc,
            context,
            canvasProperties,
        });
    }
}

function drawGate({
    element,
    pinHighlights,

    rc,
    context,
    canvasProperties,

    isGhostElement = false,
}: {
    element: RenderableElement;
    pinHighlights: ElementPin["uid"][];

    rc: RoughCanvas;
    context: CanvasRenderingContext2D;
    canvasProperties: CanvasProperties;
    isGhostElement?: boolean;
}) {
    let { seed, tmIcon, iconRect, io, rect, config } = element;
    seed += 1;
    const ghostElementColor = isGhostElement ? GHOST_ELEMENT_COLOR : undefined;
    const bgColor = canvasProperties.bgColor || "#fff";
    const roughness = 0.5;
    const hachureGap = 4;
    const info = elementsInfo.get(config.type);
    const elementColor = config.color || "#000";

    // INFO: for debug bounding box
    const rects: BoundingRect[] = [[0, 0, rect[2], rect[3]], iconRect];

    const gateConfig = {
        bgConfig: {
            seed,
            roughness,
            fill: bgColor,
            fillStyle: "solid",
            stroke: ghostElementColor || elementColor,
        },
        fgConfig: {
            seed,
            roughness,
            fill: ghostElementColor || elementColor,
            fillStyle: "hachure",
            hachureAngle: -41 + (config?.rotation || 0),
            hachureGap,
            stroke: ghostElementColor,
        },
    };
    if (info?.path) {
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
        rc.rectangle(...iconRect, {
            seed,
            roughness,
            fill: bgColor,
            fillStyle: "solid",
            stroke: ghostElementColor,
            strokeWidth: 1 * canvasProperties.zoom,
        });
        context.fillText(config.type, iconRect[0], iconRect[1]);
    }

    const pinsConfig = {
        seed,
        roughness,
        bowing: 20,
        // fill: bgColor,
        // fillStyle: "solid",
        strokeWidth: 1 * (config.scale || 1),
        stroke: ghostElementColor,
    };
    // render input and outputs
    for (let pin of io.pins) {
        const rect = pin.rect;
        rects.push(pin.rect);
        const isHighlighted = pinHighlights.includes(pin.uid);
        if (pin.negate) {
            rc.circle(rect[0] + rect[2] / 2, rect[1] + rect[3] / 2, rect[3], {
                ...pinsConfig,
                fillStyle: "hachure",
                hachureGap,
            });
        } else {
            rc.rectangle(
                ...rect,
                pinsConfig
            );
        }
        if (isHighlighted) {
                rc?.circle(
                    rect[0] + rect[2]/2,
                    rect[1] + rect[3]/2,
                    2,
                    {
                        seed,
                        roughness: 0.5,
                        fillStyle: "solid",
                        stroke: "black",
                    }
                );
                context.fillText(pin.uid.slice(0,4), 
                    rect[0],
                    rect[1]
            );
        }
    }

    for (let line of io.lines) {
        rc.line(...line, pinsConfig);
    }

    if (DEBUG_BOUNDING_BOX) {
        const debugConfig = {
            seed,
            roughness,
            fill: undefined,
            stroke: COLOR_PALETTE.blue[1],
        };
        rects.forEach((rect) => {
            rc.rectangle(...rect, debugConfig);
            rc.circle(rect[0], rect[1], 2, { ...debugConfig });
        });
    }
}

function renderGateIcon({
    rc,
    paths,
    isGhostElement,
    noFillPathIndex,
    config,
}: {
    rc: RoughCanvas;
    paths: string | string[];
    isGhostElement?: boolean;
    noFillPathIndex?: number[];
    config: {
        bgConfig: Options;
        fgConfig: Options;
    };
}) {
    if (Array.isArray(paths)) {
        paths.forEach((path, i) => {
            if (
                isGhostElement ||
                (noFillPathIndex && noFillPathIndex.includes(i))
            ) {
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
