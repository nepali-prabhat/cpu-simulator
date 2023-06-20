import { AppState, CanvasProperties, Element } from "@/types";
import { dotsGrid, strokeGrid } from "./grid";
import { GRID_TYPE, SELECT_PADDING, SELECT_SIZE } from "@/constants";
import { filterElementsByIds, getBoundingRect } from "./utils";
import { RoughCanvas } from "roughjs/bin/canvas";

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

    // ctx.strokeRect(scroll.x, scroll.y, 2, 2);
    context.restore();
}

function renderElements({
    appState,
    context,
    canvasProperties,
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

        switch (element.type) {
            case "and_gate": {
                context.beginPath();
                context.strokeStyle = "#000";
                context.strokeRect(0, 0, element.width, element.height);
                context.fillText("AND", 0, -5);
                break;
            }
            case "or_gate": {
                context.beginPath();
                context.strokeStyle = "#000";
                context.strokeRect(0, 0, element.width, element.height);
                context.arc(
                    element.width / 2 - 0.5,
                    element.height / 2 - 0.5,
                    element.width / 3,
                    0,
                    2 * Math.PI
                );
                context.stroke();
                context.fillText("OR", 0, -5);
                break;
            }
            case "not_gate": {
                context.beginPath();
                context.strokeStyle = "#000";
                context.strokeRect(0, 0, element.width, element.height);
                context.strokeRect(
                    element.width / 3,
                    element.height / 3,
                    element.width / 3,
                    element.height / 3
                );
                context.fillText("NOT", 0, -5);
                break;
            }
        }
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
    // TODO: make this a constant
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
        renderBoundingBox(context, scroll, selectRect, {
            padding: 0,
            size: 0,
            renderHandles: false,
        });
    }
}

export function renderBoundingBox(
    context: CanvasRenderingContext2D,
    scroll: { x: number; y: number },
    rect: { x: number; y: number; width: number; height: number },
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
    context.save();
    context.translate(rect.x + scroll.x, rect.y + scroll.y);
    const color = "hsl(207, 83%, 79%)";
    context.fillStyle = color;
    context.strokeStyle = color;
    if (renderHandles) {
        context.fillRect(0 - size - padding, 0 - size - padding, size, size);
        context.fillRect(rect.width + padding, 0 - padding - size, size, size);
        context.fillRect(0 - size - padding, rect.height + padding, size, size);
        context.fillRect(
            rect.width + padding,
            rect.height + padding,
            size,
            size
        );
    }
    context.strokeRect(
        0 - size / 2 - padding,
        0 - size / 2 - padding,
        rect.width + size + padding * 2,
        rect.height + size + padding * 2
    );

    context.restore();
}
