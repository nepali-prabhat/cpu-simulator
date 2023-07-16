import rough from "roughjs/bin/rough";
import minBy from "lodash.minby";
import { useCallback, useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
    AppState,
    Point,
    PointerState,
    GhostElement,
    WireHighlights,
} from "@/types";
import { renderCanvas } from "./render";
import {
    filterElementsByIds,
    getBoundingRect,
    getCanvasPointFromViewport,
    getElementsAt,
    getSelectedElements,
    isBoxInsideAnotherBox,
    isPointInsideBox,
} from "./utils";
import {
    GRID_SPACE,
    WIRES_SNAP_DISTANCE,
    ZOOM_STEP,
} from "@/constants/constants";
import {
    sceneAtom,
    scrollAtom,
    setViewportZoom,
    canvasDimensionAtom,
    getZoomFromStore,
} from "@/state/scene";
import {
    appStateAtom,
    selectRectAtom,
    setGhostPosition as _setGhostPosition,
    showGhost,
} from "@/state/appState";
import { moveSelectedElementsAtom } from "@/state/elements";

import {
    addToActiveInputsCountAtom,
    rotateActiveElementConfigAtom,
    selectedElementTypeAtom,
    selectedElementIdsAtom,
    selectedWireIdsAtom,
} from "@/state/ui";
import { areSamePoints, getGridPoint, getNormalizedZoom } from "@/utils";
import { isMenuOpenAtom } from "@/state/ui";
import {
    addElementAtom,
    deleteSelectedElementsAtom,
    elementsAtom,
} from "@/state/elements";
import { convertRectToBox, getIntersectedRectOfElement } from "@/utils/box";
import { WithRequired } from "@/utilTypes";
import { nanoid } from "nanoid";
import {
    addWireAtom,
    deleteSelectedWiresAtom,
    deleteWiresAtom,
    highlightedWireIdsAtom,
    updateWireAtom,
} from "@/state/wires";
import { randomInteger } from "@/utils/random";
import { getWiresAt, lengthSquared } from "@/utils/wires";

const gridSpace = GRID_SPACE;

export function useCanvas({ offset }: { offset?: Partial<Point> } = {}) {
    const canvasProperties = useAtomValue(sceneAtom);
    const appState = useAtomValue(appStateAtom);

    const setScroll = useSetAtom(scrollAtom);
    const setZoom = useSetAtom(setViewportZoom);
    const setDimension = useSetAtom(canvasDimensionAtom);

    const setActiveElementType = useSetAtom(selectedElementTypeAtom);
    const addElement = useSetAtom(addElementAtom);
    const setGhostPosition = useSetAtom(_setGhostPosition);
    const setShowGhost = useSetAtom(showGhost);
    const setIsMenuOpen = useSetAtom(isMenuOpenAtom);
    const setSelectedElementIds = useSetAtom(selectedElementIdsAtom);
    const setSelectedWireIds = useSetAtom(selectedWireIdsAtom);
    const setElements = useSetAtom(elementsAtom);
    const setSelectRect = useSetAtom(selectRectAtom);
    const rotateGhostElement = useSetAtom(rotateActiveElementConfigAtom);
    const addToGeInputsCount = useSetAtom(addToActiveInputsCountAtom);
    const deleteSelectedElements = useSetAtom(deleteSelectedElementsAtom);
    const deleteSelectedWires = useSetAtom(deleteSelectedWiresAtom);
    const moveSelectedElements = useSetAtom(moveSelectedElementsAtom);

    const addWire = useSetAtom(addWireAtom);
    const updateWire = useSetAtom(updateWireAtom);
    const deleteWires = useSetAtom(deleteWiresAtom);
    const setHighlightedWireIds = useSetAtom(highlightedWireIdsAtom);

    const scroll = canvasProperties.scroll;
    const zoom = canvasProperties.zoom;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lastViewportPosition = useRef<Point>({ x: 0, y: 0 });
    const pointerRef = useRef<PointerState | null>(null);

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            // need to throttle this
            e.preventDefault();
            e.stopPropagation();
            const { deltaX, deltaY } = e;

            const rate = 1;

            let isZoom = e.ctrlKey || e.metaKey;
            if (isZoom) {
                const sign = Math.sign(deltaY);
                const MAX_STEP = ZOOM_STEP * 100;
                const absDelta = Math.abs(deltaY);
                let delta = deltaY;
                if (absDelta > MAX_STEP) {
                    delta = MAX_STEP * sign;
                }

                setZoom((v) => {
                    let newZoom = v - delta / 100;

                    // logarithmically increase zoom steps the more zoomed-in we are (applies to >100% only)
                    newZoom +=
                        Math.log10(Math.max(1, v)) *
                        -sign *
                        // reduced amplification for small deltas (small movements on a trackpad)
                        Math.min(1, absDelta / 20);
                    return {
                        zoom: newZoom,
                        viewport: {
                            x: lastViewportPosition.current.x,
                            y: lastViewportPosition.current.y,
                        },
                    };
                });
            }

            if (!isZoom) {
                const lockX = e.shiftKey && !e.metaKey;
                const zoom = getZoomFromStore();
                if (lockX) {
                    setScroll((v) => ({
                        ...v,
                        x: v.x - (deltaX * rate) / zoom,
                    }));
                } else {
                    setScroll((v) => ({
                        x: v.x - (deltaX * rate) / zoom,
                        y: v.y - (deltaY * rate) / zoom,
                    }));
                }
            }
        },
        [setScroll, setZoom]
    );

    // NOTE: canvas event handlers
    useEffect(() => {
        let canvas = canvasRef.current;

        const _handleWheel = (e: WheelEvent) => handleWheel(e);

        if (canvas) {
            canvas.addEventListener("wheel", _handleWheel, {
                passive: false,
            });
        }

        return () => {
            canvas?.removeEventListener("wheel", _handleWheel);
        };
    }, [handleWheel]);

    // NOTE: window and document event handlers
    useEffect(() => {
        const _resizeHandler = () => {
            setDimension(() => ({
                width: window.innerWidth,
                height: window.innerHeight,
            }));
        };
        _resizeHandler();

        const _mouseMoveHanlder = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            lastViewportPosition.current = { x: clientX, y: clientY };
        };
        window.addEventListener("resize", _resizeHandler);
        document.addEventListener("mousemove", _mouseMoveHanlder);
        return () => {
            window.removeEventListener("resize", _resizeHandler);
            document.removeEventListener("mousemove", _mouseMoveHanlder);
        };
    }, [setActiveElementType, setDimension, setIsMenuOpen, setZoom]);

    const keydownHandler = useCallback(
        (e: KeyboardEvent) => {
            // console.log("e.key: ", e.key, e);
            if ((e.ctrlKey || e.metaKey) && e.key === "0") {
                setZoom((_, c) => ({
                    viewport: {
                        x: c.width / 2,
                        y: c.height / 2,
                    },
                    zoom: getNormalizedZoom(1),
                }));
            } else if (e.key === "Escape") {
                setActiveElementType(undefined);
                if (pointerRef.current?.wireId) {
                    deleteWires([pointerRef.current.wireId]);
                    pointerRef.current.wireId = undefined;
                }
                // setIsMenuOpen(false);
            } else if (!(e.ctrlKey || e.metaKey) && e.key === "r") {
                rotateGhostElement(90);
            } else if (e.shiftKey && e.key === "ArrowUp") {
                addToGeInputsCount(1);
            } else if (e.shiftKey && e.key === "ArrowDown") {
                addToGeInputsCount(-1);
            } else if (e.key === "Backspace") {
                deleteSelectedElements();
                deleteSelectedWires();
            } else if (e.key === "ArrowUp") {
                moveSelectedElements([0, -GRID_SPACE]);
            } else if (e.key === "ArrowDown") {
                moveSelectedElements([0, GRID_SPACE]);
            } else if (e.key === "ArrowRight") {
                moveSelectedElements([GRID_SPACE, 0]);
            } else if (e.key === "ArrowLeft") {
                moveSelectedElements([-GRID_SPACE, 0]);
            }
        },
        [
            setZoom,
            setActiveElementType,
            rotateGhostElement,
            addToGeInputsCount,
            deleteSelectedElements,
            deleteSelectedWires,
            deleteWires,
            moveSelectedElements,
        ]
    );

    useEffect(() => {
        const _keydownHandler = keydownHandler;
        window.addEventListener("keydown", _keydownHandler);
        return () => {
            window.removeEventListener("keydown", _keydownHandler);
        };
    }, [keydownHandler]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        const rc = canvas ? rough.canvas(canvasRef.current) : null;
        if (canvas && context) {
            renderCanvas({
                context,
                canvasProperties,
                gridSpace,
                appState,
                rc,
            });
        }
    }, [canvasProperties, appState]);

    // Sync canvas
    useEffect(() => {
        draw();
    }, [draw]);

    const handlePointerDown: React.MouseEventHandler<HTMLCanvasElement> = (
        e
    ) => {
        const { clientX, clientY } = e;
        const viewportXY = { x: clientX, y: clientY };
        const canvasXY = getCanvasPointFromViewport(
            { zoom, scroll },
            viewportXY,
            offset
        );
        const shiftPressed = e.shiftKey;

        const elementsMap = appState.elements;
        const initialSelectedElementIds = appState.selectedElementIds;
        const initialSelectedWireIds = appState.selectedWireIds;
        const initialSelectedPinIds = appState.selectedPinIds;

        const ghostElement = appState.ghostElement;

        const processGhostElement =
            ghostElement && ghostElement.show && ghostElement.rect;

        if (processGhostElement) {
            addElement(ghostElement as WithRequired<GhostElement, "rect">);
            setActiveElementType(undefined);
        }

        if (!processGhostElement) {
            const { topLevelElement: clickedElement } = getElementsAt(
                { x: canvasXY.x, y: canvasXY.y },
                Object.values(elementsMap)
            );

            const existingSelectedElements = filterElementsByIds(
                initialSelectedElementIds,
                elementsMap
            );

            const selectBoundingBox = getBoundingRect(existingSelectedElements);

            let preserveSelectBox = shiftPressed;
            let clickedInsideSelectBox = isPointInsideBox(
                canvasXY,
                selectBoundingBox
            );
            if (selectBoundingBox) {
                preserveSelectBox = shiftPressed || clickedInsideSelectBox;
            }

            let newSelectedElementIds = new Set<string>();
            if (preserveSelectBox) {
                newSelectedElementIds = new Set(initialSelectedElementIds);
            }

            const addClickedElement = !clickedInsideSelectBox || e.shiftKey;
            if (clickedElement && addClickedElement) {
                newSelectedElementIds.add(clickedElement.uid);
            }

            let newSelectedWireIds = new Set<string>(initialSelectedWireIds);
            if (!shiftPressed || clickedInsideSelectBox) {
                newSelectedWireIds.clear();
            }

            const intersectedElementRect = clickedElement
                ? getIntersectedRectOfElement(clickedElement, [
                    canvasXY.x,
                    canvasXY.y,
                ])
                : undefined;

            const pinRect = intersectedElementRect?.find((v) =>
                ["output", "input", "select"].includes(v.type)
            );
            const wireHighlights = appState.wireHighlights;

            // Process wire
            const processWire =
                initialSelectedElementIds.size === 0 && !preserveSelectBox;
            let wireId;
            if (processWire && pinRect) {
                wireId = nanoid();
                const touchingPinIds = [pinRect.uid];
                const touchingWireIds: string[] = [];
                const startPoint = {
                    x: pinRect.rect[0] + pinRect.rect[2] / 2,
                    y: pinRect.rect[1] + pinRect.rect[3] / 2,
                };
                const endPoint = {
                    x: startPoint.x,
                    y: startPoint.y,
                };
                const points: [Point, Point] = [startPoint, endPoint];
                addWire({
                    uid: wireId,
                    zIndex: 0,
                    seed: randomInteger(),
                    touchingPinIds,
                    touchingWireIds,
                    points,
                });
            }
            if (processWire && !pinRect && wireHighlights?.length) {
                wireId = nanoid();
                const highlight = wireHighlights.find(
                    (v) => v.projectedPoint !== undefined
                );
                if (highlight && highlight.projectedPoint) {
                    const touchingWireIds = [highlight.uid];
                    const touchingPinIds: string[] = [];
                    const points: [Point, Point] = [
                        highlight.projectedPoint,
                        canvasXY,
                    ];
                    addWire({
                        uid: wireId,
                        zIndex: 0,
                        seed: randomInteger(),
                        touchingPinIds,
                        touchingWireIds,
                        points,
                    });
                }
            }

            let selectRect: AppState["selectRect"] = undefined;
            if (!clickedElement && !clickedInsideSelectBox && !wireId) {
                selectRect = {
                    x: canvasXY.x,
                    y: canvasXY.y,
                    width: 0,
                    height: 0,
                };
            }

            // initial pointer state
            pointerRef.current = {
                moved: false,
                movedElementIds: new Set(),
                elementsMap,
                timeStamp: e.timeStamp,
                lastPoint: canvasXY,
                initial: {
                    viewportXY,
                    canvasXY,
                    selectedElementIds: initialSelectedElementIds,
                    selectedWireIds: initialSelectedWireIds,
                    selectedPinIds: initialSelectedPinIds,
                },
                intersectedElementRect,
                intersectedElement: clickedElement,
                wireId,
            };

            !wireId && setSelectedElementIds(newSelectedElementIds);
            setSelectRect(selectRect);
        }
    };

    const handlePointerMove: React.MouseEventHandler<HTMLCanvasElement> = (
        e
    ) => {
        const { clientX, clientY } = e;
        const viewportXY = { x: clientX, y: clientY };
        const canvasXY = getCanvasPointFromViewport(
            { zoom, scroll },
            viewportXY,
            offset
        );

        setGhostPosition([canvasXY.gridX, canvasXY.gridY]);

        let wireId = pointerRef.current?.wireId;
        if (!pointerRef.current || wireId) {
            const lockAxis =
                e.shiftKey &&
                wireId &&
                appState.wires[wireId] &&
                appState.wires[wireId].points.length > 1;
            const intersectedWires = getWiresAt(
                lockAxis ? appState.wires[wireId!].points.at(1)! : canvasXY,
                Object.values(appState.wires)
            );
            const newHighlights: WireHighlights = [];
            if (wireId) {
                newHighlights.push({ uid: wireId });
            }

            const nearestHighlighted = minBy(
                intersectedWires.wireHighlights.filter(
                    (v) => v.uid !== wireId && v.length
                ),
                (v) => v.length
            );

            nearestHighlighted && newHighlights.push(nearestHighlighted);
            setHighlightedWireIds(newHighlights);
        }

        if (pointerRef.current) {
            const lastPoint = pointerRef.current.lastPoint;
            const dp = {
                x: canvasXY.x - lastPoint.x,
                y: canvasXY.y - lastPoint.y,
            };

            const newSelectedElementIds = new Set(appState.selectedElementIds);

            // If there is select Rect, change  its width and height
            let selectRect = appState.selectRect;
            if (selectRect) {
                selectRect = {
                    ...selectRect,
                    width: canvasXY.x - selectRect.x,
                    height: canvasXY.y - selectRect.y,
                };
            }

            if (wireId) {
                updateWire({
                    uid: wireId,
                    updater: (v) => {
                        let endPoint: Point;
                        if (e.shiftKey) {
                            endPoint =
                                Math.abs(v.points[0].x - canvasXY.x) >
                                    Math.abs(v.points[0].y - canvasXY.y)
                                    ? {
                                        x: canvasXY.x,
                                        y: v.points[0].y,
                                    }
                                    : {
                                        x: v.points[0].x,
                                        y: canvasXY.y,
                                    };
                        } else {
                            endPoint = canvasXY;
                        }
                        return {
                            points: [v.points[0], endPoint],
                        };
                    },
                });
            }

            let updatedSelectedElements: AppState["elements"] = {};
            // get elements that fall inside the select Rect.
            if (!wireId) {
                if (selectRect) {
                    // add new selected elements
                    for (let element of Object.values(appState.elements)) {
                        if (
                            isBoxInsideAnotherBox(
                                convertRectToBox(element.rect),
                                selectRect
                            )
                        ) {
                            newSelectedElementIds.add(element.uid);
                        }
                    }
                } else {
                    // move the elements
                    const elementsMap = pointerRef.current.elementsMap;
                    const selectedElements = getSelectedElements({
                        selectedElementIds: newSelectedElementIds,
                        elements: elementsMap,
                    });
                    for (let element of selectedElements) {
                        updatedSelectedElements[element.uid] = {
                            ...element,
                            rect: [
                                element.rect[0] + dp.x,
                                element.rect[1] + dp.y,
                                element.rect[2],
                                element.rect[3],
                            ],
                        };
                    }
                }
            }

            // get new elements value snapped to grid
            let elementsSnappedToGrid: AppState["elements"] = {
                ...appState.elements,
            };
            let movedElementIds: Set<string> = new Set(
                pointerRef.current.movedElementIds
            );
            for (let uid in appState.elements) {
                const originalElement = appState.elements[uid];
                const element = updatedSelectedElements[uid];
                if (element && originalElement) {
                    const newPosition = getGridPoint(
                        element.rect[0],
                        element.rect[1]
                    );
                    elementsSnappedToGrid[uid] = {
                        ...element,
                        rect: [
                            ...newPosition,
                            element.rect[2],
                            element.rect[3],
                        ],
                    };
                    if (
                        newPosition[0] !== originalElement.rect[0] ||
                        newPosition[1] !== originalElement.rect[1]
                    ) {
                        movedElementIds.add(uid);
                    }
                }
            }

            pointerRef.current = {
                ...pointerRef.current,
                elementsMap: {
                    ...pointerRef.current.elementsMap,
                    ...updatedSelectedElements,
                },
                movedElementIds,
                wireId,
                moved: true,
                lastPoint: canvasXY,
            };
            setElements(elementsSnappedToGrid);
            setSelectedElementIds(newSelectedElementIds);
            setSelectRect(selectRect);
        }
    };

    const handlePointerUp: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
        const shiftPressed = e.shiftKey;
        if (pointerRef.current) {
            let newSelectedElementIds = new Set(appState.selectedElementIds);
            let newSelectedWireIds = new Set(appState.selectedWireIds);

            const {
                movedElementIds,
                intersectedElement: clickedElement,
                initial: {
                    selectedElementIds: initialSelectedElementIds,
                    selectedWireIds: initialSelectedWireIds,
                },
            } = pointerRef.current;

            const elementsMoved = movedElementIds.size > 1;
            const hadPriorSelections = initialSelectedElementIds.size > 1;
            let preserveSelectedElements =
                shiftPressed || elementsMoved || !hadPriorSelections;

            if (!preserveSelectedElements) {
                newSelectedElementIds.clear();
                clickedElement && newSelectedElementIds.add(clickedElement.uid);
            }
            const toggleClickedElement =
                shiftPressed &&
                clickedElement &&
                !elementsMoved &&
                initialSelectedElementIds.has(clickedElement.uid);
            if (toggleClickedElement) {
                newSelectedElementIds.delete(clickedElement.uid);
            }

            const preserveSelectedElement = shiftPressed;
            if (!preserveSelectedElement) {
                newSelectedWireIds.clear();
            }

            for (let { uid } of appState.wireHighlights) {
                if (initialSelectedWireIds.has(uid)) {
                    newSelectedWireIds.delete(uid);
                } else {
                    newSelectedWireIds.add(uid);
                }
            }

            const wireId = pointerRef.current.wireId;
            const newWire = wireId && appState.wires[wireId];

            let deleteNewWire =
                newWire &&
                (!pointerRef.current?.moved ||
                    areSamePoints(...newWire.points) ||
                    lengthSquared(...newWire.points) <= WIRES_SNAP_DISTANCE);

            if (!deleteNewWire && newWire) {
                const { wireHighlights } = getWiresAt(
                    newWire.points[1],
                    Object.values(appState.wires)
                );
                const { projectedPoint } =
                    minBy(
                        wireHighlights.filter((v) => v.uid !== wireId),
                        (v) => v.length
                    ) || {};

                deleteNewWire =
                    projectedPoint &&
                    lengthSquared(newWire.points[0], projectedPoint) <=
                    WIRES_SNAP_DISTANCE;

                if (!deleteNewWire && projectedPoint) {
                    updateWire({
                        uid: wireId,
                        updater: (v) => {
                            let points = v.points;
                            if (projectedPoint) {
                                points = [v.points[0], projectedPoint];
                            }
                            return {
                                points,
                            };
                        },
                    });
                }
            }

            pointerRef.current = null;

            if (deleteNewWire && wireId) {
                deleteWires([wireId]);
            }
            setSelectedElementIds(newSelectedElementIds);
            setSelectedWireIds(newSelectedWireIds);
            setSelectRect(undefined);
        }
    };

    const handlePointerEnter: React.MouseEventHandler<
        HTMLCanvasElement
    > = () => {
        const ghostElement = appState.ghostElement;
        if (ghostElement) {
            setShowGhost(true);
        }
    };

    const handlePointerLeave: React.MouseEventHandler<
        HTMLCanvasElement
    > = () => {
        const ghostElement = appState.ghostElement;
        if (ghostElement) {
            setShowGhost(false);
        }
    };

    const handleCanvasContextMenu: React.MouseEventHandler<
        HTMLCanvasElement
    > = (e) => {
        e.preventDefault();
    };

    return {
        canvasRef,
        canvasProperties,
        handleCanvasContextMenu,
        setZoom,
        handlePointerDown,
        handlePointerMove,
        handlePointerLeave,
        handlePointerEnter,
        handlePointerUp,
    };
}
