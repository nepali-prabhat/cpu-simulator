import { useCallback, useEffect, useRef, useState } from "react";
import {
    Element,
    AppState,
    CanvasProperties,
    Point,
    PointerState,
} from "@/types";
import { wheelHandler } from "./eventHandlers";
import { renderCanvas } from "./render";
import { nanoid } from "nanoid";
import { getNormalizedZoom, getStateForZoom } from "./zoom";
import {
    filterElementsByIds,
    getBoundingRect,
    getCanvasPointFromViewport,
    getElementsAt,
    getSelectedElements,
    isPointInsideBox,
} from "./utils";

const ids = [nanoid(), nanoid(), nanoid()];
export function useCanvas({
    defaultGridSpace = 40,
}: {
    defaultGridSpace?: number;
}) {
    const [gridSpace] = useState(defaultGridSpace);
    const [canvasProperties, setCanvasProperties] = useState<CanvasProperties>({
        width: window.innerWidth || 300,
        height: window.innerHeight || 150,
        scroll: { x: 0, y: 0 },
        zoom: getNormalizedZoom(1.5),
    });
    const [appState, setAppState] = useState<AppState>({
        /* elements: [
            {
                uid: ids[0],
                x: gridSpace,
                y: gridSpace,
                width: 60,
                height: 60,
                type: "and_gate",
                zIndex: 0,
                nonce: 0,
            },
            {
                uid: ids[1],
                x: gridSpace - 100,
                y: gridSpace / 2 + 100,
                width: 60,
                height: 60,
                type: "or_gate",
                zIndex: 0,
                nonce: 1,
            },
            {
                uid: ids[2],
                x: gridSpace / 2 + 100,
                y: gridSpace / 2 + 100,
                width: 60,
                height: 60,
                type: "not_gate",
                zIndex: 0,
                nonce: 2,
            },
        ], */
        elements: {
            [ids[0]]: {
                uid: ids[0],
                x: gridSpace,
                y: gridSpace,
                width: 60,
                height: 60,
                type: "and_gate",
                zIndex: 0,
                nonce: 0,
            },
            [ids[1]]: {
                uid: ids[1],
                x: gridSpace - 100,
                y: gridSpace / 2 + 100,
                width: 60,
                height: 60,
                type: "or_gate",
                zIndex: 0,
                nonce: 1,
            },
            [ids[2]]: {
                uid: ids[2],
                x: gridSpace / 2 + 100,
                y: gridSpace / 2 + 100,
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

    const setScroll = (
        o: (
            v: Point,
            a: CanvasProperties
        ) => Partial<CanvasProperties["scroll"]>
    ) => {
        setCanvasProperties((v) => ({
            ...v,
            scroll: {
                ...v.scroll,
                ...o(v.scroll, v),
            },
        }));
    };

    const setZoom = (
        o: (
            v: number,
            a: CanvasProperties
        ) => Partial<Pick<CanvasProperties, "zoom" | "scroll">>
    ) => {
        setCanvasProperties((v) => ({
            ...v,
            ...o(v.zoom, v),
        }));
    };
    // NOTE: canvas event handlers
    useEffect(() => {
        let canvas = canvasRef.current;

        const _wheelHandler = (e: WheelEvent) =>
            wheelHandler(e, setScroll, setZoom, lastViewportPosition.current);

        if (canvas) {
            canvas.addEventListener("wheel", _wheelHandler, {
                passive: false,
            });
        }

        return () => {
            canvas?.removeEventListener("wheel", _wheelHandler);
        };
    }, []);

    // NOTE: window and document event handlers
    useEffect(() => {
        const _resizeHandler = () => {
            setCanvasProperties((v) => ({
                ...v,
                width: window.innerWidth,
                height: window.innerHeight,
            }));
        };
        const _mouseMoveHanlder = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            lastViewportPosition.current = { x: clientX, y: clientY };
        };
        const _keydownHandler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "0") {
                setZoom((_, c) =>
                    getStateForZoom(
                        {
                            viewportX: c.width / 2,
                            viewportY: c.height / 2,
                            nextZoom: getNormalizedZoom(1),
                        },
                        c
                    )
                );
            }
        };
        window.addEventListener("resize", _resizeHandler);
        window.addEventListener("keydown", _keydownHandler);
        document.addEventListener("mousemove", _mouseMoveHanlder);
        return () => {
            window.removeEventListener("resize", _resizeHandler);
            document.removeEventListener("mousemove", _mouseMoveHanlder);
        };
    }, []);

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
    }, [appState, canvasProperties, gridSpace]);

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
            canvasProperties,
            viewportXY
        );
        console.log(
            "pointer down canvas x, y",
            canvasXY.x,
            canvasXY.y,
            canvasProperties
        );

        const {
            topLevelElement,
            // elementIds: intersectedElementIds,
            // elements: intersectedElements,
        } = getElementsAt(
            { x: canvasXY.x, y: canvasXY.y },
            Object.values(appState.elements)
        );
        console.log("top level element: ", topLevelElement);

        const existingSelectedElements = filterElementsByIds(
            appState.selectedElementIds,
            appState.elements
        );

        const selectBoundingBox = getBoundingRect(existingSelectedElements);

        let preserveSelectBox = e.shiftKey;
        if (selectBoundingBox) {
            preserveSelectBox =
                preserveSelectBox ||
                isPointInsideBox(canvasXY, selectBoundingBox);
        }

        const selectedElementIds = new Set<string>([
            ...(topLevelElement ? [topLevelElement.uid] : []),
            // ...(Array.from(intersectedElementIds)),
            ...(preserveSelectBox
                ? Array.from(appState.selectedElementIds)
                : []),
        ]);

        // initial pointer state
        pointerRef.current = {
            moved: false,
            selectedElementIds,
            boundingBox: selectBoundingBox,
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
        });
    };

    const handlePointerMove: React.MouseEventHandler<HTMLCanvasElement> = (
        e
    ) => {
        const { clientX, clientY } = e;
        const viewportXY = { x: clientX, y: clientY };
        const canvasXY = getCanvasPointFromViewport(
            canvasProperties,
            viewportXY
        );
        if (pointerRef.current) {
            pointerRef.current.moved = true;
            const lastPoint = pointerRef.current.lastPoint;
            const dp = {
                x: canvasXY.x - lastPoint.x,
                y: canvasXY.y - lastPoint.y,
            };
            const boundingBox = pointerRef.current.boundingBox;
            // translate bounding box
            let newBoundingBox = boundingBox
                ? {
                    ...boundingBox,
                    x: boundingBox.x - dp.x,
                    y: boundingBox.y - dp.y,
                }
                : undefined;
            pointerRef.current.boundingBox = newBoundingBox;

            const selectedElements = getSelectedElements(appState);
            const updatedSelectedElements: AppState["elements"] = {};
            for (let element of selectedElements) {
                updatedSelectedElements[element.uid] = {
                    ...element,
                    x: element.x + dp.x,
                    y: element.y + dp.y,
                };
            }

            pointerRef.current = {
                ...pointerRef.current,
                moved: true,
                boundingBox: newBoundingBox,
                lastPoint: canvasXY,
            };
            setAppState((s) => ({
                ...s,
                elements: { ...s.elements, ...updatedSelectedElements },
            }));
        }
    };
    const handlePointerUp: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
        console.log("pointer up: ", e);
        const { clientX, clientY } = e;
        const viewportXY = { x: clientX, y: clientY };
        const canvasXY = getCanvasPointFromViewport(
            canvasProperties,
            viewportXY
        );
        console.log(
            "pointer up canvas x, y",
            canvasXY.x,
            canvasXY.y,
            canvasProperties
        );

        const {
            topLevelElement,
            // elementIds: intersectedElementIds,
            // elements: intersectedElements,
        } = getElementsAt(
            { x: canvasXY.x, y: canvasXY.y },
            Object.values(appState.elements)
        );
        console.log("top level element: ", topLevelElement);

        if (pointerRef.current) {
            let selectedElementIds = appState.selectedElementIds;
            let preserveSelectBox = e.shiftKey || pointerRef.current.moved;
            selectedElementIds = new Set<string>([
                ...(topLevelElement ? [topLevelElement.uid] : []),
                // ...(Array.from(intersectedElementIds)),
                ...(preserveSelectBox
                    ? Array.from(appState.selectedElementIds)
                    : []),
            ]);
            pointerRef.current = null;
            setAppState({
                ...appState,
                selectedElementIds,
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
