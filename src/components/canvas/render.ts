import { AppState, CanvasProperties } from "@/types";
import { dotsGrid } from "./grid";

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
    // console.log("origin zoom: ", scroll, zoom);

    // clear background
    context.save();
    context.clearRect(0, 0, width, height);
    context.restore();

    // apply zoom
    context.scale(zoom, zoom);

    dotsGrid(
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
    const { elements, selectedElementIds } = appState;
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
    const selectedElements = elements.filter((e) =>
        selectedElementIds.has(e.uid)
    );
    for (let element of selectedElements) {
        context.save();
        context.translate(element.x + scroll.x, element.y + scroll.y);
        const color = "hsl(207, 83%, 79%)";
        context.fillStyle = color;
        context.strokeStyle = color;
        const padding = 2;
        const size = 7;
        context.fillRect(0 - size - padding, 0 - size - padding, size, size);
        context.fillRect(
            element.width + padding,
            0 - padding - size,
            size,
            size
        );
        context.fillRect(
            0 - size - padding,
            element.height + padding,
            size,
            size
        );
        context.fillRect(
            element.width + padding,
            element.height + padding,
            size,
            size
        );

        context.strokeRect(
            0 - size / 2 - padding,
            0 - size / 2 - padding,
            element.width + size  + padding * 2,
            element.height + size  + padding * 2
        );

        context.restore();
    }
    console.log("selected elements: ", selectedElements);
}
