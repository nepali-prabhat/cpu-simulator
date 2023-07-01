import { COLOR_PALETTE } from "@/colors";
import { DEBUG_BOUNDING_BOX } from "@/constants/constants";
import { elementsInfo } from "@/constants/elementsInfo";
import {
    BoundingRect,
    CanvasProperties,
    ElementConfig,
    ElementPins,
    GhostElement,
} from "@/types";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Options } from "roughjs/bin/core";
import { Matrix } from "transformation-matrix";

export function renderElement({
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
    if (rc && element.rect) {
        // Transformation matrices
        drawGate({
            ...element,
            rect: element.rect,
            rc,
            context,
            canvasProperties,
        });
    }
}

function drawGate({
    tmIcon,
    iconRect,
    io,
    rect,
    config,

    rc,
    context,
    seed,
    canvasProperties,
}: {
    io: ElementPins;
    tmIcon: Matrix;
    rect: BoundingRect;
    iconRect: BoundingRect;
    config: ElementConfig;

    rc: RoughCanvas;
    context: CanvasRenderingContext2D;
    seed: number;
    canvasProperties: CanvasProperties;
}) {
    seed += 1;
    const bgColor = canvasProperties.bgColor || "#fff";
    const roughness = 0.2;
    const hachureGap = 4;
    const elementColor = config.color || "#000";
    const info = elementsInfo.get(config.type);

    // INFO: for debug bounding box
    const rects: BoundingRect[] = [[0, 0, rect[2], rect[3]], iconRect];

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
            stroke: elementColor,
            strokeWidth: 1 * canvasProperties.zoom,
        });
        context.fillText(config.type, iconRect[0], iconRect[1]);
    }

    const pinsConfig = {
        seed,
        roughness,
        bowing: 20,
        fill: bgColor,
        fillStyle: "solid",
        strokeWidth: 1 * (config.scale || 1),
    };
    // render input and outputs
    for (let pin of io.pins) {
        rects.push(pin.rect);
        if (pin.negate) {
            const rect = pin.rect;
            rc.circle(rect[0] + rect[2] / 2, rect[1] + rect[3] / 2, rect[3], {
                ...pinsConfig,
                fillStyle: "hachure",
                hachureGap,
            });
        } else {
            rc.rectangle(...pin.rect, pinsConfig);
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
