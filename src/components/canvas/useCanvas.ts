import { useCallback, useEffect, useRef, useState } from "react";
import {
    AppState,
    CanvasProperties,
    NormalizedZoomValue,
    Point,
} from "@/types";
import { wheelHandler } from "./eventHandlers";
import { renderCanvas } from "./render";
import { nanoid } from "nanoid";

export function useCanvas({
    defaultGridSpace = 20,
}: {
    defaultGridSpace?: number;
}) {
    const [gridSpace, setGridSpace] = useState(defaultGridSpace);
    const [canvasProperties, setCanvasProperties] = useState<CanvasProperties>({
        width: window.innerWidth || 300,
        height: window.innerHeight || 150,
        scroll: { x: 0, y: 0 },
        zoom: 1 as NormalizedZoomValue,
    });
    const [appState, setAppState] = useState<AppState>({
        elements: [
            {
                uid: nanoid(),
                x: 20,
                y: 20,
                type: "and_gate",
            },
            {
                uid: nanoid(),
                x: 20,
                y: 100,
                type: "or_gate",
            },
            {
                uid: nanoid(),
                x: 100,
                y: 100,
                type: "not_gate",
            },
        ],
    });

    let canvasRef = useRef<HTMLCanvasElement>(null);
    let lastViewportPosition = useRef<Point>({ x: 0, y: 0 });

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
        window.addEventListener("resize", _resizeHandler);
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
    };
}
