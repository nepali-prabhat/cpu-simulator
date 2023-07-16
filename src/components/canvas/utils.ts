import { GRID_SPACE, SELECT_PADDING } from "@/constants/constants";
import {
    AppState,
    BoundingBox,
    Element,
    NormalizedZoomValue,
    Point,
} from "@/types";
import { getGridPoint } from "@/utils";
import { convertRectToBox } from "@/utils/box";

export function getElementsAt(coordinates: Point, elements: Element[]) {
    const { x: canvasX, y: canvasY } = coordinates;
    let topLevelElement: Element | undefined;
    let intersectedElementIds: Set<string> = new Set();
    let intersectedElements: Element[] = [];
    for (let element of elements) {
        const { x, y, width, height } = convertRectToBox(element.rect);
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
                        element.seed >= topLevelElement.seed
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
    viewportPoint: Point,
    offset?: Partial<Point>
) {
    const _offset = {
        x: (offset || {}).x || 0,
        y: (offset || {}).y || 0,
    };
    const canvasX =
        (viewportPoint.x - _offset.x) / canvasProperties.zoom -
        canvasProperties.scroll.x;
    const canvasY =
        (viewportPoint.y - _offset.y) / canvasProperties.zoom -
        canvasProperties.scroll.y;
    const gridCoords = getGridPoint(canvasX, canvasY, GRID_SPACE);
    return {
        x: canvasX,
        y: canvasY,
        gridX: gridCoords[0],
        gridY: gridCoords[1],
    };
}

export function getBoundingRect(elements: Element[]) {
    let bounds: { min: Point; max: Point } | undefined;
    for (let element of elements) {
        if (bounds === undefined) {
            bounds = {
                min: { x: element.rect[0], y: element.rect[1] },
                max: {
                    x: element.rect[0] + element.rect[2],
                    y: element.rect[1] + element.rect[3],
                },
            };
        } else {
            bounds.min.x = Math.min(bounds.min.x, element.rect[0]);
            bounds.min.y = Math.min(bounds.min.y, element.rect[1]);

            bounds.max.x = Math.max(
                bounds.max.x,
                element.rect[0] + element.rect[2]
            );
            bounds.max.y = Math.max(
                bounds.max.y,
                element.rect[1] + element.rect[3]
            );
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

export function getSelectedElements(
    appState: Pick<AppState, "selectedIds" | "elements">
) {
    return filterElementsByIds(appState.selectedIds, appState.elements);
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
