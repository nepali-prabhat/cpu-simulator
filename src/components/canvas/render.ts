import { AppState, BoundingBox, CanvasProperties, Element } from "@/types";
import { dotsGrid, strokeGrid } from "./grid";
import { GRID_TYPE, SELECT_PADDING, SELECT_SIZE } from "@/constants/constants";
import { filterElementsByIds, getBoundingRect } from "./utils";
import { RoughCanvas } from "roughjs/bin/canvas";
import { elementsInfo } from "@/constants/elementsInfo";
import { renderGate } from "./renderGates";

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

            // 0,0,
            width / zoom,
            height / zoom
        );

    GRID_TYPE === "lines" &&
        strokeGrid(
            context,
            gridSpace,

            -Math.ceil(zoom / gridSpace) * gridSpace + (scroll.x % gridSpace),
            -Math.ceil(zoom / gridSpace) * gridSpace + (scroll.y % gridSpace),

            // 0,0,
            width / zoom,
            height / zoom
        );

    /* renderGlostElement({
        appState,
        context,
        canvasProperties,
        rc,
    }); */

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

    // ctx.strokeRect(scroll.x, scroll.y, 2, 2);
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
    const ghostElement = appState.ghostElement;
    if (ghostElement?.show && ghostElement?.x && ghostElement?.y) {
        const { scroll } = canvasProperties;
        context.save();
        context.translate(ghostElement.x + scroll.x, ghostElement.y + scroll.y);
        renderGate({
            element: {
                type: ghostElement.elementConfig.type,
                nonce: ghostElement.nonce,
            },
            rc,
            context,
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
        context.translate(element.x + scroll.x, element.y + scroll.y);
        context.scale(
            element.width /
            (elementsInfo.get(element.type)?.width || element.width),
            element.height /
            (elementsInfo.get(element.type)?.height || element.height)
        );
        renderGate({ element, rc, context });
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
        renderBoundingBox(context, scroll, element, {
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
