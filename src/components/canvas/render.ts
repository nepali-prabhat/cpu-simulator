import { AppState, BoundingBox, CanvasProperties, Element } from "@/types";
import { dotsGrid, strokeGrid } from "./grid";
import { GRID_TYPE, SELECT_PADDING, SELECT_SIZE } from "@/constants/constants";
import { filterElementsByIds, getBoundingRect } from "./utils";
import { RoughCanvas } from "roughjs/bin/canvas";
import { renderElement } from "./renderGates";
import { convertRectToBox } from "@/utils/box";
import { getDefaultStore } from "jotai";
import { COLOR_PALETTE } from "@/colors";

export function renderCanvas({
    context,
    canvasProperties,
    gridSpace,
    appState,
    rc,
}: {
    context: CanvasRenderingContext2D;
    canvasProperties: CanvasProperties;
    gridSpace: number;
    appState: AppState;
    rc: RoughCanvas | null;
}) {
    const { scroll, zoom } = canvasProperties;
    const { width, height } = canvasProperties.dimension;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.save();

    // clear background
    context.save();
    context.clearRect(0, 0, width, height);
    context.fillStyle = canvasProperties.bgColor || "white";
    context.fillRect(0, 0, width, height);
    context.restore();

    // apply zoom
    context.scale(zoom, zoom);

    GRID_TYPE === "dots" &&
        dotsGrid(
            context,
            gridSpace,

            -Math.ceil(zoom / gridSpace) * gridSpace + (scroll.x % gridSpace),
            -Math.ceil(zoom / gridSpace) * gridSpace + (scroll.y % gridSpace),

            width / zoom,
            height / zoom
        );

    GRID_TYPE === "lines" &&
        strokeGrid(
            context,
            gridSpace,

            -Math.ceil(zoom / gridSpace) * gridSpace + (scroll.x % gridSpace),
            -Math.ceil(zoom / gridSpace) * gridSpace + (scroll.y % gridSpace),

            width / zoom,
            height / zoom
        );

    renderElements({
        appState,
        context,
        canvasProperties,
        rc,
    });

    renderSelectBox({
        appState,
        context,
        canvasProperties,
    });

    renderGhostElement({
        appState,
        context,
        canvasProperties,
        rc,
    });

    rc?.circle(0, 0, 5, {
        fill: "black",
        seed: 1,
        stroke: COLOR_PALETTE.blue[2],
    });

    context.restore();
}

function renderGhostElement({
    appState,
    context,
    canvasProperties,
    rc,
}: {
    appState: AppState;
    canvasProperties: CanvasProperties;
    context: CanvasRenderingContext2D;
    rc: RoughCanvas | null;
}) {
    const element = appState.ghostElement;
    if (element && element?.show) {
        const { scroll } = canvasProperties;
        context.save();
        context.translate(
            element.rect[0] + scroll.x,
            element.rect[1] + scroll.y
        );
        renderElement({
            element,
            isGhostElement: true,
            rc,
            context,
            canvasProperties,
        });
        context.restore();
    }
}

function renderElements({
    appState,
    context,
    canvasProperties,
    rc,
}: {
    appState: AppState;
    canvasProperties: CanvasProperties;
    context: CanvasRenderingContext2D;
    rc: RoughCanvas | null;
}) {
    const { scroll } = canvasProperties;
    const { elements } = appState;

    for (let element of Object.values(elements)) {
        context.save();
        /* context.fillText(
            `x: ${element.rect[0].toFixed(2)} y:${element.rect[1].toFixed(2)}`,
            element.rect[0] + scroll.x,
            element.rect[1] + scroll.y
        );
        const topLeft = element.rect;
        for (let pin of element.io.pins) {
            const [x, y, width, height] = pin.rect;
            const effectiveRect = [
                topLeft[0] + x,
                topLeft[1] + y,
                width,
                height,
            ];
            context.fillText(
                `x: ${effectiveRect[0].toFixed(2)} y:${effectiveRect[1].toFixed(
                    2
                )}`,
                effectiveRect[0] + scroll.x,
                effectiveRect[1] + scroll.y
            );
        } */
        context.translate(
            element.rect[0] + scroll.x,
            element.rect[1] + scroll.y
        );
        renderElement({
            element,
            rc,
            context,
            canvasProperties,
        });
        context.restore();
    }
}

function renderSelectBox({
    appState,
    context,
    canvasProperties,
}: {
    appState: AppState;
    canvasProperties: CanvasProperties;
    context: CanvasRenderingContext2D;
}) {
    const { scroll } = canvasProperties;
    const { elements, selectedElementIds, selectRect } = appState;

    const existingSelectedElements: Element[] = [];
    appState.selectedElementIds.forEach((uid) => {
        const element = appState.elements[uid];
        if (element) {
            existingSelectedElements.push(element);
        }
    });

    const selectedElements = filterElementsByIds(selectedElementIds, elements);

    const multipleSelected = selectedElements.length > 1;
    for (let element of selectedElements) {
        // draw selection box in selected elements
        renderBoundingBox(context, scroll, convertRectToBox(element.rect), {
            renderHandles: !multipleSelected,
        });
    }

    if (multipleSelected) {
        const bounds = getBoundingRect(selectedElements);
        if (bounds) {
            renderBoundingBox(context, scroll, bounds, {
                renderHandles: true,
                padding: 0,
            });
        }
    }

    // render select rect
    if (selectRect) {
        renderSelectRect(context, scroll, selectRect);
    }
}

function renderSelectRect(
    context: CanvasRenderingContext2D,
    scroll: { x: number; y: number },
    rect: BoundingBox
) {
    const lineWidth = 1;
    context.save();
    context.translate(rect.x + scroll.x, rect.y + scroll.y);
    context.fillStyle = "rgba(115, 193, 252,0.1)";
    context.strokeStyle = "rgba(115, 193, 252,1)";
    context.lineWidth = lineWidth;
    context.fillRect(
        0,
        0 + lineWidth,
        rect.width - lineWidth,
        rect.height - lineWidth
    );
    context.strokeRect(
        0,
        0 + lineWidth,
        rect.width - lineWidth,
        rect.height - lineWidth
    );
    context.restore();
}

function renderBoundingBox(
    context: CanvasRenderingContext2D,
    scroll: { x: number; y: number },
    rect: BoundingBox,
    {
        renderHandles = true,
        padding = SELECT_PADDING,
        size = SELECT_SIZE,
    }: Partial<{
        renderHandles: boolean;
        padding: number;
        size: number;
    }> = {}
) {
    const lineWidth = 1;
    context.save();
    context.translate(rect.x + scroll.x, rect.y + scroll.y);
    const color = "hsl(207, 83%, 79%)";
    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    if (renderHandles) {
        context.fillRect(
            0 - size / 2 - padding,
            0 - size / 2 - padding,
            size,
            size
        );
        context.fillRect(
            rect.width + padding - size / 2,
            0 - padding - size / 2,
            size,
            size
        );
        context.fillRect(
            0 - size / 2 - padding,
            rect.height + padding - size / 2,
            size,
            size
        );
        context.fillRect(
            rect.width + padding - size / 2,
            rect.height + padding - size / 2,
            size,
            size
        );
    }
    context.strokeRect(
        0 - padding,
        0 - padding,
        rect.width + padding * 2,
        rect.height + padding * 2
    );

    context.restore();
}
