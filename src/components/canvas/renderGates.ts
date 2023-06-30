import { COLOR_PALETTE } from "@/colors";
import { DEBUG_BOUNDING_BOX } from "@/constants/constants";
import { elementsInfo } from "@/constants/elementsInfo";
import {
    BoundingRect,
    CanvasProperties,
    Element,
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
    if (!rc) {
        return;
    }

    // Transformation matrices
    drawGate({
        ...element,
        rc,
        context,
        bgColor: canvasProperties.bgColor,
    });
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
    bgColor = "#fff",
}: {
    io: ElementPins;
    tmIcon: Matrix;
    rect: BoundingRect;
    iconRect: BoundingRect;
    config: ElementConfig;

    rc: RoughCanvas;
    context: CanvasRenderingContext2D;
    seed: number;
    bgColor?: string;
}) {
    seed += 1;
    const roughness = 0.2;
    const hachureGap = 4;
    const elementColor = config.color || "#000";
    const info = elementsInfo.get(config.type);

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
            strokeWidth: 1,
        });
        context.fillText(config.type, iconRect[0], iconRect[1]);
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
    for (let pin of io.pins) {
        if (pin.negate) {
            const rect = pin.rect;
            rc.circle(rect[0], rect[1], rect[3], pinsConfig);
        } else {
            rc.rectangle(...pin.rect, pinsConfig);
        }
    }

    for (let line of io.lines) {
        rc.line(...line, pinsConfig);
    }

    if (DEBUG_BOUNDING_BOX) {
        const rects: BoundingRect[] = [[0, 0, rect[2], rect[3]], iconRect];
        rects.forEach((rect) => {
            rc.rectangle(...rect, {
                seed,
                roughness,
                fill: undefined,
                stroke: COLOR_PALETTE.blue[1],
            });
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
