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
    for (let element of appState.elements) {
        context.save();
        context.translate(element.x + scroll.x, element.y + scroll.y);

        switch (element.type) {
            case "and_gate": {
                context.beginPath();
                context.strokeStyle = "#000";
                context.strokeRect(0, 0, 60, 60);
                context.strokeRect(0, 0, 20, 20);
                context.strokeRect(40, 0, 20, 20);
                context.strokeRect(0, 40, 20, 20);
                context.fillText("AND", 0, -5);
                context.strokeRect(40, 40, 20, 20);
                break;
            }
            case "or_gate": {
                context.beginPath();
                context.strokeStyle = "#000";
                context.strokeRect(0, 0, 60, 60);
                context.arc(29.5, 29.5, 20, 0, 2 * Math.PI);
                context.stroke();
                context.fillText("OR", 0, -5);
                break;
            }
            case "not_gate": {
                context.beginPath();
                context.strokeStyle = "#000";
                context.strokeRect(0, 0, 60, 60);
                context.strokeRect(20, 20, 20, 20);
                context.fillText("NOT", 0, -5);
                break;
            }
        }

        context.restore();
    }
}
