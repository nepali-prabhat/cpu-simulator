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
        const config = { seed: element.nonce + 1, roughness: 0.5 };

        switch (element.type) {
            case "and_gate": {
                rc?.path(
                    "M10 16a2 2 0 1 0 0 4v-4Zm0 4h12v-4H10v4ZM10 44a2 2 0 1 0 0 4v-4Zm0 4h12v-4H10v4Z",
                    config
                );
                rc?.path(
                    "M54 32c0 12.275-8.485 22-21.294 22H24a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2h8.706C45.516 10 54 19.725 54 32Z",
                    config
                );
                break;
            }
            case "or_gate": {
                rc?.path(
                    "M10 16a2 2 0 1 0 0 4v-4Zm0 4h12v-4H10v4Zm0 24a2 2 0 1 0 0 4v-4Zm0 4h12v-4H10v4Z",
                    config
                );
                rc?.path(
                    "M18.545 53.159C21.691 48.892 25 42.03 25 32.132c0-10.102-3.446-17.113-6.637-21.422-.011-.015-.06-.091-.065-.274a1.477 1.477 0 0 1 .133-.628 1.027 1.027 0 0 1 .29-.4c3.549.296 7.703.78 10.806 1.535 7.86 1.915 19.239 7.755 22.345 20.832a1.56 1.56 0 0 1 0 .713C48.77 45.534 37.42 51.134 29.527 53.057c-3.038.74-7.084 1.218-10.587 1.516a1.136 1.136 0 0 1-.317-.44 1.624 1.624 0 0 1-.144-.68c.005-.2.057-.282.066-.294Z",
                    config
                );
                break;
            }
            case "not_gate": {
                rc?.path("M9 30a2 2 0 1 0 0 4v-4Zm0 4h10v-4H9v4Z", config);
                rc?.path(
                    "M44.898 33.664 20.11 50.19C18.78 51.076 17 50.123 17 48.526V15.474c0-1.597 1.78-2.55 3.11-1.664l24.788 16.526a2 2 0 0 1 0 3.328Z",
                    config
                );
                rc?.circle(53, 32, 4, config);
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
