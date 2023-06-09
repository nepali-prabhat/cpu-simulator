import { useCallback, useEffect, useRef, useState } from "react";
import {
    Element,
    AppState,
    CanvasProperties,
    Point,
    PointerState,
} from "@/types";
import { handleWheel } from "./eventHandlers";
import { renderCanvas } from "./render";
import { nanoid } from "nanoid";
import { getNormalizedZoom, getStateForZoom } from "./zoom";
import {
    filterElementsByIds,
    getBoundingRect,
    getCanvasPointFromViewport,
    getElementsAt,
    getSelectedElements,
    isBoxInsideAnotherBox,
    isPointInsideBox,
} from "./utils";
import { GRID_SPACE, INITIAL_ZOOM } from "@/constants";

const ids = [nanoid(), nanoid(), nanoid()];
export function useCanvas({
    defaultGridSpace = GRID_SPACE,
}: {
    defaultGridSpace?: number;
}) {
    const [gridSpace] = useState(defaultGridSpace);
    const [canvasProperties, setCanvasProperties] = useState<CanvasProperties>({
        height: window.innerHeight || 150,
        width: window.innerWidth || 300,
        scroll: { x: 0, y: 0 },
        zoom: getNormalizedZoom(INITIAL_ZOOM),
    });
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
        // selectRect: {
        //     x: gridSpace * 3,
        //     y: gridSpace * 9,
        //     width: -60,
        //     height: -60,
        // },
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

        const _handleWheel = (e: WheelEvent) =>
            handleWheel(e, setScroll, setZoom, lastViewportPosition.current);

        if (canvas) {
            canvas.addEventListener("wheel", _handleWheel, {
                passive: false,
            });
        }

        return () => {
            canvas?.removeEventListener("wheel", _handleWheel);
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
            canvasProperties,
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
