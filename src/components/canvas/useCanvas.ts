import { useCallback, useEffect, useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Element, AppState, Point, PointerState } from "@/types";
import { renderCanvas } from "./render";
import { nanoid } from "nanoid";
import {
    filterElementsByIds,
    getBoundingRect,
    getCanvasPointFromViewport,
    getElementsAt,
    getSelectedElements,
    isBoxInsideAnotherBox,
    isPointInsideBox,
} from "./utils";
import { GRID_SPACE, ZOOM_STEP } from "@/constants";
import {
    sceneAtom,
    scrollAtom,
    setViewportZoom,
    canvasDimensionAtom,
    getNormalizedZoom,
    getZoomFromStore,
} from "@/state/scene";

const ids = [nanoid(), nanoid(), nanoid()];
const gridSpace = GRID_SPACE;

export function useCanvas() {
    const canvasProperties = useAtomValue(sceneAtom);

    const setScroll = useSetAtom(scrollAtom);
    const setZoom = useSetAtom(setViewportZoom);
    const setDimension = useSetAtom(canvasDimensionAtom);

    const scroll = canvasProperties.scroll;
    const zoom = canvasProperties.zoom;

    const [appState, setAppState] = useState<AppState>({
        elements: {
            [ids[0]]: {
                uid: ids[0],
                x: gridSpace * 6,
                y: gridSpace * 4,
                width: 60,
                height: 60,
                type: "and_gate",
                zIndex: 0,
                nonce: 0,
            },
            [ids[1]]: {
                uid: ids[1],
                x: gridSpace + gridSpace * 10,
                y: gridSpace + gridSpace * 5,
                width: 60,
                height: 60,
                type: "or_gate",
                zIndex: 0,
                nonce: 1,
            },
            [ids[2]]: {
                uid: ids[2],
                x: gridSpace * 3,
                y: gridSpace * 9,
                width: 60,
                height: 60,
                type: "not_gate",
                zIndex: 0,
                nonce: 2,
            },
        },
        selectedElementIds: new Set<string>(),
    });

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
        console.log("window and document event handlers");

        const _mouseMoveHanlder = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            lastViewportPosition.current = { x: clientX, y: clientY };
        };
        const _keydownHandler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "0") {
                setZoom((_, c) => ({
                    viewport: {
                        x: c.width / 2,
                        y: c.height / 2,
                    },
                    zoom: getNormalizedZoom(1),
                }));
            }
        };
        window.addEventListener("resize", _resizeHandler);
        window.addEventListener("keydown", _keydownHandler);
        document.addEventListener("mousemove", _mouseMoveHanlder);
        return () => {
            window.removeEventListener("resize", _resizeHandler);
            document.removeEventListener("mousemove", _mouseMoveHanlder);
        };
    }, [setDimension, setZoom]);

    const draw = useCallback(() => {
        const context = canvasRef.current?.getContext("2d");
        if (context) {
            renderCanvas({
                context,
                canvasProperties,
                gridSpace,
                appState,
            });
        }
    }, [appState, canvasProperties]);

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
            viewportXY
        );
        // console.log(
        //     "pointer down canvas x, y",
        //     canvasXY.x,
        //     canvasXY.y,
        //     canvasProperties
        // );

        const { topLevelElement } = getElementsAt(
            { x: canvasXY.x, y: canvasXY.y },
            Object.values(appState.elements)
        );

        const existingSelectedElements = filterElementsByIds(
            appState.selectedElementIds,
            appState.elements
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

        const selectedElementIds = new Set<string>([
            ...(topLevelElement && !isClickedInsideSelectBox
                ? [topLevelElement.uid]
                : []),
            // ...(Array.from(intersectedElementIds)),
            ...(preserveSelectBox
                ? Array.from(appState.selectedElementIds)
                : []),
        ]);

        // If there is no top level element, render a select box
        let selectRect: AppState["selectRect"] = undefined;
        if (!topLevelElement && !isClickedInsideSelectBox) {
            selectRect = { x: canvasXY.x, y: canvasXY.y, width: 0, height: 0 };
        }

        // initial pointer state
        pointerRef.current = {
            moved: false,
            selectedElementIds,
            timeStamp: e.timeStamp,
            lastPoint: canvasXY,
            initial: {
                viewportXY,
                canvasXY,
            },
        };

        setAppState({
            ...appState,
            selectedElementIds,
            selectRect,
        });
    };

    const handlePointerMove: React.MouseEventHandler<HTMLCanvasElement> = (
        e
    ) => {
        const { clientX, clientY } = e;
        const viewportXY = { x: clientX, y: clientY };
        const canvasXY = getCanvasPointFromViewport(
            { zoom, scroll },
            viewportXY
        );

        if (pointerRef.current) {
            const lastPoint = pointerRef.current.lastPoint;
            const dp = {
                x: canvasXY.x - lastPoint.x,
                y: canvasXY.y - lastPoint.y,
            };

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
            if (!selectRect) {
                // move the elements
                const selectedElements = getSelectedElements(appState);
                for (let element of selectedElements) {
                    updatedSelectedElements[element.uid] = {
                        ...element,
                        x: element.x + dp.x,
                        y: element.y + dp.y,
                    };
                }
            } else {
                // add new selected elements
                for (let element of Object.values(appState.elements)) {
                    if (isBoxInsideAnotherBox(element, selectRect)) {
                        additionalSelectedElements.push(element.uid);
                    }
                }
            }

            pointerRef.current = {
                ...pointerRef.current,
                moved: true,
                lastPoint: canvasXY,
            };

            setAppState((s) => ({
                ...s,
                elements: { ...s.elements, ...updatedSelectedElements },
                selectedElementIds: new Set([
                    ...Array.from(s.selectedElementIds),
                    ...additionalSelectedElements,
                ]),
                selectRect,
            }));
        }
    };

    const handlePointerUp: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
        if (pointerRef.current) {
            let selectedElementIds = appState.selectedElementIds;

            let preserveSelectBox =
                e.shiftKey ||
                pointerRef.current.moved ||
                pointerRef.current.selectedElementIds.size === 1;
            if (!preserveSelectBox) {
                selectedElementIds = new Set<string>();
            }

            pointerRef.current = null;
            setAppState({
                ...appState,
                selectedElementIds,
                selectRect: undefined,
            });
        }
    };

    const handleCanvasContextMenu: React.MouseEventHandler<
        HTMLCanvasElement
    > = (e) => {
        e.preventDefault();
        console.log("context menu: ", e);
    };

    return {
        canvasRef,
        canvasProperties,
        handleCanvasContextMenu,
        setZoom,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
    };
}
