import { AppState, CanvasProperties, Element, Point } from "@/types";
import { dotsGrid, strokeGrid } from "./grid";
import { SELECT_PADDING, SELECT_SIZE } from "@/constants";
const size = SELECT_SIZE;
const padding = SELECT_PADDING;

export function renderCanvas({
    context,
    canvasProperties,
    gridSpace,
    appState,
}: {
    context: CanvasRenderingContext2D;
    canvasProperties: CanvasProperties;
    gridSpace: number;
    appState: AppState;
}) {
    const { scroll, zoom, width, height } = canvasProperties;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.save();
    console.log("origin zoom: ", scroll, zoom);

    // clear background
    context.save();
    context.clearRect(0, 0, width, height);
    context.restore();

    // apply zoom
    context.scale(zoom, zoom);

    false &&
        dotsGrid(
            context,
            gridSpace,

            -Math.ceil(zoom / gridSpace) * gridSpace + (scroll.x % gridSpace),
            -Math.ceil(zoom / gridSpace) * gridSpace + (scroll.y % gridSpace),

            // 0,0,
            width / zoom,
            height / zoom
        );

    true &&
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
    });

    renderSelectArea({
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
}) {
    const { scroll } = canvasProperties;
    const { elements } = appState;
    for (let element of elements) {
        context.save();
        context.translate(element.x + scroll.x, element.y + scroll.y);

        switch (element.type) {
            case "and_gate": {
                context.beginPath();
                context.strokeStyle = "#000";
                context.strokeRect(0, 0, element.width, element.height);
                context.strokeRect(0, 0, element.width / 3, element.height / 3);
                context.strokeRect(
                    (element.width / 3) * 2,
                    0,
                    element.width / 3,
                    element.height / 3
                );
                context.strokeRect(
                    0,
                    (element.width / 3) * 2,
                    element.width / 3,
                    element.height / 3
                );
                context.strokeRect(
                    (element.width / 3) * 2,
                    (element.width / 3) * 2,
                    element.width / 3,
                    element.height / 3
                );
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
function renderSelectArea({
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
    const { elements, selectedElementIds } = appState;
    const selectedElements = elements.filter((e) =>
        selectedElementIds.has(e.uid)
    );

    const multipleSelected = selectedElements.length > 1;
    let bounds: { min: Point; max: Point } | undefined;
    for (let element of selectedElements) {
        if (multipleSelected) {
            // create bounds based on all the selected elements
            if (bounds === undefined) {
                bounds = {
                    min: { x: element.x, y: element.y },
                    max: {
                        x: element.x + element.width,
                        y: element.y + element.height,
                    },
                };
            } else {
                bounds.min.x = Math.min(bounds.min.x, element.x);
                bounds.min.y = Math.min(bounds.min.y, element.y);

                bounds.max.x = Math.max(
                    bounds.max.x,
                    element.x + element.width
                );
                bounds.max.y = Math.max(
                    bounds.max.y,
                    element.y + element.height
                );
            }
        }
        // draw selection box in selected elements
        renderBoundingBox(context, scroll, element, {
            renderHandles: !multipleSelected,
        });
    }
    if (bounds) {
        // TODO: add padding and size to the bound.
        bounds.min.x -= padding;
        bounds.min.y -= padding;
        bounds.max.x += padding;
        bounds.max.y += padding;

        // TODO: draw bounds
        renderBoundingBox(
            context,
            scroll,
            {
                x: bounds.min.x,
                y: bounds.min.y,
                width: bounds.max.x - bounds.min.x,
                height: bounds.max.y - bounds.min.y,
            },
            {
                renderHandles: true,
                padding: 0,
            }
        );
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
function getViewportPoints(scroll: Point, p: Point) {
    return {
        x: p.x + scroll.x,
        y: p.y + scroll.y,
    };
}
