"use client";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef, useCallback } from "react";

type Point = { x: number; y: number };
type NormalizedZoomValue = number & { _brand: "normalizedZoom" };

const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.1;

// TODO: understand this code
const getStateForZoom = (
    {
        viewportX,
        viewportY,
        nextZoom,
    }: {
        viewportX: number;
        viewportY: number;
        nextZoom: NormalizedZoomValue;
    },
    appState: CanvasProperties
) => {
    const appLayerX = viewportX;
    const appLayerY = viewportY;

    const currentZoom = appState.zoom;

    // get original scroll position without zoom
    const baseScrollX =
        appState.scroll.x + (appLayerX - appLayerX / currentZoom);
    const baseScrollY =
        appState.scroll.y + (appLayerY - appLayerY / currentZoom);

    // get scroll offsets for target zoom level
    const zoomOffsetScrollX = -(appLayerX - appLayerX / nextZoom);
    const zoomOffsetScrollY = -(appLayerY - appLayerY / nextZoom);

    return {
        scroll: {
            x: baseScrollX + zoomOffsetScrollX,
            y: baseScrollY + zoomOffsetScrollY,
        },
        zoom: nextZoom,
    };
};
const strokeGrid = (
    context: CanvasRenderingContext2D,
    gridSize: number,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number
) => {
    context.save();
    context.strokeStyle = "rgba(0,0,0,0.1)";
    context.beginPath();
    for (let x = offsetX; x < offsetX + width + gridSize * 2; x += gridSize) {
        context.moveTo(x, offsetY - gridSize);
        context.lineTo(x, offsetY + height + gridSize * 2);
    }
    for (let y = offsetY; y < offsetY + height + gridSize * 2; y += gridSize) {
        context.moveTo(offsetX - gridSize, y);
        context.lineTo(offsetX + width + gridSize * 2, y);
    }
    context.stroke();
    context.restore();
};

export function getNormalizedZoom(zoom: number): NormalizedZoomValue {
    return Math.max(MIN_ZOOM, Math.min(zoom, 30)) as NormalizedZoomValue;
}

function wheelHandler(
    e: WheelEvent,
    setScroll: (
        o: (
            v: Point,
            a: CanvasProperties
        ) => Partial<CanvasProperties["scroll"]>
    ) => void,
    setZoom: (
        o: (
            v: number,
            a: CanvasProperties
        ) => Partial<Pick<CanvasProperties, "zoom" | "scroll">>
    ) => void,
    lastViewportPosition: Point
) {
    // need to throttle this
    e.preventDefault();
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

        setZoom((v, canvasProperties) => {
            const zoom = { value: v };
            let newZoom = zoom.value - delta / 100;
            // increase zoom steps the more zoomed-in we are (applies to >100% only)
            newZoom +=
                Math.log10(Math.max(1, zoom.value)) *
                -sign *
                // reduced amplification for small deltas (small movements on a trackpad)
                Math.min(1, absDelta / 20);
            return getStateForZoom(
                {
                    viewportX: lastViewportPosition.x,
                    viewportY: lastViewportPosition.y,
                    nextZoom: getNormalizedZoom(newZoom),
                },
                canvasProperties
            );
        });
    }

    if (!isZoom) {
        const lockX = e.shiftKey && !e.metaKey;
        if (lockX) {
            setScroll((v, a) => ({
                x: v.x - (deltaX * rate) / a.zoom,
            }));
        } else {
            setScroll((v, a) => ({
                x: v.x - (deltaX * rate) / a.zoom,
                y: v.y - (deltaY * rate) / a.zoom,
            }));
        }
    }
}

type CanvasProperties = {
    width: number;
    height: number;
    scroll: Point;
    zoom: NormalizedZoomValue;
};
function Home() {
    const [gridSpace, setGridSpace] = useState(20);
    const [canvasProperties, setCanvasProperties] = useState<CanvasProperties>({
        width: window.innerWidth || 300,
        height: window.innerHeight || 150,
        scroll: { x: 0, y: 0 },
        zoom: 1 as NormalizedZoomValue,
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

    // add event handlers
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
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx && canvasRef.current) {
            const { scroll, zoom, width, height } = canvasProperties;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.save();
            console.log("origin zoom: ", scroll, zoom);

            // clear background
            ctx.save();
            ctx.clearRect(0, 0, width, height);
            ctx.restore();

            // apply zoom
            ctx.scale(zoom, zoom);

            strokeGrid(
                ctx,
                gridSpace,

                -Math.ceil(zoom / gridSpace) * gridSpace +
                (scroll.x % gridSpace),
                -Math.ceil(zoom / gridSpace) * gridSpace +
                (scroll.y % gridSpace),

                // 0,0,

                width / zoom,
                height / zoom
            );

            // Some test element in the canvas
            ctx.save();
            ctx.translate(0 + scroll.x, 0 + scroll.y);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(0, 0, 100, 100);

            ctx.strokeStyle = "#000";
            ctx.strokeRect(60, 20, 20, 20);
            ctx.strokeRect(20, 20, 20, 20);
            ctx.strokeRect(20, 55, 60, 20);

            ctx.strokeStyle = "#000";
            ctx.strokeRect(0, 0, 2, 2);
            ctx.strokeRect(scroll.x, scroll.y, 2, 2);
            ctx.restore();

            ctx.restore();
        }
    }, [canvasProperties, gridSpace]);

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

    return (
        <main className={`relative w-screen min-h-screen overflow-hidden`}>
            <section>
                <canvas
                    ref={canvasRef}
                    className={`bg-none`}
                    id="root"
                    width={canvasProperties.width}
                    height={canvasProperties.height}
                    onContextMenu={handleCanvasContextMenu}
                >
                    screen for cpu simulation
                </canvas>
            </section>
            <section className="absolute top-0 right-0">
                <div>
                    <button
                        onClick={() => {
                            setZoom(() => ({
                                zoom: getNormalizedZoom(0.75),
                            }));
                        }}
                    >
                        |zoom .75|
                    </button>
                    <button
                        onClick={() => {
                            setZoom(() => ({
                                zoom: getNormalizedZoom(1.5),
                            }));
                        }}
                    >
                        |zoom 1.5|
                    </button>
                </div>
            </section>
        </main>
    );
}
// TODO: resolve hydration errors by having the same layout during rendering in server and in client.
// ... use some sort of loader and wait for the canvas element to process before showing it in the browser.
export default dynamic(() => Promise.resolve(Home), { ssr: false });
// export default Home;
