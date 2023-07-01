import rough from "roughjs/bin/rough";
import { useCallback, useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Element, AppState, Point, PointerState, GhostElement } from "@/types";
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
import { GRID_SPACE, ZOOM_STEP } from "@/constants/constants";
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
    selectedElementIdsAtom,
    setGhostPosition as _setGhostPosition,
    showGhost,
} from "@/state/appState";

import {
    addToGEInputsCountAtom,
    rotateGhostElementAtom,
    selectedElementTypeAtom,
} from "@/state/ui";
import { getNormalizedZoom } from "@/utils";
import { isMenuOpenAtom } from "@/state/ui";
import { addElementAtom, elementsAtom } from "@/state/elements";
import { convertRectToBox } from "@/utils/box";
import { WithRequired } from "@/utilTypes";

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
    const setElements = useSetAtom(elementsAtom);
    const setSelectRect = useSetAtom(selectRectAtom);
    const rotateGhostElement = useSetAtom(rotateGhostElementAtom);
    const addToGeInputsCount = useSetAtom(addToGEInputsCountAtom);

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
            console.log("e key: ", e.key);
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
                // setIsMenuOpen(false);
            } else if (!(e.ctrlKey || e.metaKey) && e.key === "r") {
                rotateGhostElement(90);
            } else if (e.key === "ArrowUp") {
                addToGeInputsCount(1);
            } else if(e.key === "ArrowDown"){
                addToGeInputsCount(-1);
            }
        },
        [
            setZoom,
            setActiveElementType,
            rotateGhostElement,
            addToGeInputsCount,
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

        const elementsMap = appState.elements;
        const selectedElementIds = appState.selectedElementIds;
        const ghostElement = appState.ghostElement;

        if (ghostElement && ghostElement.show && ghostElement.rect) {
            // setShowGhost(false);
            addElement(ghostElement as WithRequired<GhostElement, "rect">);
            setActiveElementType(undefined);
        } else {
            const { topLevelElement } = getElementsAt(
                { x: canvasXY.x, y: canvasXY.y },
                Object.values(elementsMap)
            );

            const existingSelectedElements = filterElementsByIds(
                selectedElementIds,
                elementsMap
            );

            const selectBoundingBox = getBoundingRect(existingSelectedElements);

            let preserveSelectBox = e.shiftKey;
            let isClickedInsideSelectBox = isPointInsideBox(
                canvasXY,
                selectBoundingBox
            );
            if (selectBoundingBox) {
                preserveSelectBox = e.shiftKey || isClickedInsideSelectBox;
            }

            const newSelectedElementIds = new Set<string>([
                ...(topLevelElement && !isClickedInsideSelectBox
                    ? [topLevelElement.uid]
                    : []),
                // ...(Array.from(intersectedElementIds)),
                ...(preserveSelectBox ? Array.from(selectedElementIds) : []),
            ]);

            // If there is no top level element, render a select box
            let selectRect: AppState["selectRect"] = undefined;
            if (!topLevelElement && !isClickedInsideSelectBox) {
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
                selectedElementIds: newSelectedElementIds,
                timeStamp: e.timeStamp,
                lastPoint: canvasXY,
                initial: {
                    viewportXY,
                    canvasXY,
                },
            };

            setSelectedElementIds(newSelectedElementIds);
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

        setGhostPosition([canvasXY.x, canvasXY.y]);

        if (pointerRef.current) {
            const lastPoint = pointerRef.current.lastPoint;
            const dp = {
                x: canvasXY.x - lastPoint.x,
                y: canvasXY.y - lastPoint.y,
            };

            const elementsMap = appState.elements;
            const selectedElementIds = appState.selectedElementIds;

            // If there is select Rect, change  its width and height
            let selectRect = appState.selectRect;
            if (selectRect) {
                selectRect = {
                    ...selectRect,
                    width: canvasXY.x - selectRect.x,
                    height: canvasXY.y - selectRect.y,
                };
            }

            // get elements that fall inside the select Rect.
            let updatedSelectedElements: AppState["elements"] = {};
            const additionalSelectedElements: Element["uid"][] = [];
            if (selectRect) {
                // add new selected elements
                for (let element of Object.values(elementsMap)) {
                    if (
                        isBoxInsideAnotherBox(
                            convertRectToBox(element.rect),
                            selectRect
                        )
                    ) {
                        additionalSelectedElements.push(element.uid);
                    }
                }
            } else {
                // move the elements
                const selectedElements = getSelectedElements({
                    selectedElementIds,
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

            pointerRef.current = {
                ...pointerRef.current,
                moved: true,
                lastPoint: canvasXY,
            };
            setElements((e) => ({ ...e, ...updatedSelectedElements }));
            setSelectedElementIds(
                (v) =>
                    new Set([...Array.from(v), ...additionalSelectedElements])
            );
            setSelectRect(selectRect);
        }
    };

    const handlePointerUp: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
        if (pointerRef.current) {
            let selectedElementIds = appState.selectedElementIds;

            let preserveSelectedElements =
                e.shiftKey ||
                pointerRef.current.moved ||
                pointerRef.current.selectedElementIds.size === 1;
            if (!preserveSelectedElements) {
                selectedElementIds = new Set<string>();
            }

            pointerRef.current = null;

            setSelectedElementIds(selectedElementIds);
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
