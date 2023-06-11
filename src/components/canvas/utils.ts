import { SELECT_PADDING } from "@/constants";
import {
    AppState,
    BoundingBox,
    Element,
    NormalizedZoomValue,
    Point,
} from "@/types";

export function getElementsAt(coordinates: Point, elements: Element[]) {
    const { x: canvasX, y: canvasY } = coordinates;
    let topLevelElement: Element | undefined;
    let intersectedElementIds: Set<string> = new Set();
    let intersectedElements: Element[] = [];
    for (let element of elements) {
        const { x, y, width, height } = element;
        if (
            canvasX >= x &&
            canvasX <= x + width &&
            canvasY >= y &&
            canvasY <= y + height
        ) {
            if (!intersectedElementIds.has(element.uid)) {
                intersectedElements.push(element);
                intersectedElementIds.add(element.uid);
                topLevelElement = topLevelElement || element;
                if (element.zIndex === topLevelElement.zIndex) {
                    topLevelElement =
                        element.nonce >= topLevelElement.nonce
                            ? element
                            : topLevelElement;
                } else if (element.zIndex !== topLevelElement.zIndex) {
                    // elements have different z index
                    topLevelElement =
                        element.zIndex >= topLevelElement.zIndex
                            ? element
                            : topLevelElement;
                }
            }
        }
    }
    return {
        topLevelElement,
        elementIds: intersectedElementIds,
        elements: intersectedElements,
    };
}
export function getCanvasPointFromViewport(
    canvasProperties: { zoom: NormalizedZoomValue; scroll: Point },
    viewportPoint: Point
) {
    const canvasX =
        viewportPoint.x / canvasProperties.zoom - canvasProperties.scroll.x;
    const canvasY =
        viewportPoint.y / canvasProperties.zoom - canvasProperties.scroll.y;
    return { x: canvasX, y: canvasY };
}
export function getBoundingRect(elements: Element[]) {
    let bounds: { min: Point; max: Point } | undefined;
    for (let element of elements) {
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

            bounds.max.x = Math.max(bounds.max.x, element.x + element.width);
            bounds.max.y = Math.max(bounds.max.y, element.y + element.height);
        }
    }
    if (bounds) {
        bounds.min.x -= SELECT_PADDING;
        bounds.min.y -= SELECT_PADDING;
        bounds.max.x += SELECT_PADDING;
        bounds.max.y += SELECT_PADDING;
        return {
            x: bounds.min.x,
            y: bounds.min.y,
            width: bounds.max.x - bounds.min.x,
            height: bounds.max.y - bounds.min.y,
        } as BoundingBox;
    }
    return;
}

export function isPointInsideBox(point: Point, boundingBox?: BoundingBox) {
    if (boundingBox) {
        // if box has negative widths, recalculate box x, y coordinates
        let box: BoundingBox = { ...boundingBox };
        if (boundingBox.width < 0) {
            box = { ...box, x: box.x + box.width, width: Math.abs(box.width) };
        }
        if (boundingBox.height < 0) {
            box = {
                ...box,
                y: box.y + box.height,
                height: Math.abs(box.height),
            };
        }

        return (
            point.x >= box.x &&
            point.x <= box.x + box.width &&
            point.y >= box.y &&
            point.y <= box.y + box.height
        );
    }
    return false;
}

export function isBoxInsideAnotherBox(
    insideBox: BoundingBox,
    outsideBox: BoundingBox
) {
    if (
        isPointInsideBox({ x: insideBox.x, y: insideBox.y }, outsideBox) &&
        isPointInsideBox(
            { x: insideBox.x + insideBox.width, y: insideBox.y },
            outsideBox
        ) &&
        isPointInsideBox(
            {
                x: insideBox.x + insideBox.width,
                y: insideBox.y + insideBox.height,
            },
            outsideBox
        ) &&
        isPointInsideBox(
            {
                x: insideBox.x,
                y: insideBox.y + insideBox.height,
            },
            outsideBox
        )
    ) {
        return true;
    }
    return false;
}

export function getSelectedElements(appState: AppState) {
    return filterElementsByIds(appState.selectedElementIds, appState.elements);
}

export function filterElementsByIds(
    ids: Set<string>,
    elements: AppState["elements"]
) {
    const filteredElements: Element[] = [];
    ids.forEach((uid) => {
        const element = elements[uid];
        if (element) {
            filteredElements.push(element);
        }
    });
    return filteredElements;
}
