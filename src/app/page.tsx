"use client";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef, useCallback } from "react";

type Point = { x: number; y: number };
type NormalizedZoomValue = number & { _brand: "normalizedZoom" };

const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.1;

function drawGrids(
    ctx: CanvasRenderingContext2D,
    canvasProperties: CanvasProperties,
    renderProperties: {
        gridSpace?: number;
    }
) {
    const { zoom, origin, width, height } = canvasProperties;
    const { gridSpace = 10 } = renderProperties;

    ctx.save();
    // translate to nearest 10th place
    let translateX = -origin.x;
    let offsetX = 0;
    if (translateX < 0) {
        offsetX = Math.abs(translateX % gridSpace);
        translateX = translateX + offsetX;
    } else {
        offsetX = gridSpace - Math.abs(translateX % gridSpace);
        translateX = translateX + offsetX;
    }

    let translateY = -origin.y;
    let offsetY = 0;
    if (translateY < 0) {
        offsetY = Math.abs(translateY % gridSpace);
        translateY = translateY + offsetY;
    } else {
        offsetY = gridSpace - Math.abs(translateY % gridSpace);
        translateY = translateY + offsetY;
    }

    ctx.translate(translateX, translateY);

    ctx.fillStyle = "#fff";
    ctx.fillRect(translateX, translateY, width + offsetX, height + offsetY);

    ctx.strokeStyle = "hsla(66, 40%, 90%, 1)";
    ctx.fillStyle = "#000";
    ctx.beginPath();

    // draw grid
    let posX = 0;
    while (posX < width) {
        let posY = 0;
        while (posY < height) {
            ctx.fillRect(posX, posY, 1, 1);
            posY += gridSpace;
        }
        posX += gridSpace;
        // if (posX < width) {
        //     ctx.moveTo(posX, 0);
        //     ctx.lineTo(posX, height);
        //     ctx.stroke();
        //     posX += gridSpace;
        // }
        // if (posY < height) {
        //     ctx.moveTo(0, posY);
        //     ctx.lineTo(width, posY);
        //     ctx.stroke();
        //     posY += gridSpace;
        // }
    }
    ctx.restore();
}

export function getNormalizedZoom(zoom: number): NormalizedZoomValue {
    return Math.max(MIN_ZOOM, Math.min(zoom, 30)) as NormalizedZoomValue;
}

function wheelHandler(
    e: WheelEvent,
    setOrigin: (o: (v: Point) => Partial<Point>) => void,
    setZoom: (o: (v: number) => NormalizedZoomValue) => void
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

        setZoom((v) => {
            const zoom = { value: v };
            let newZoom = zoom.value - delta / 100;
            // increase zoom steps the more zoomed-in we are (applies to >100% only)
            newZoom +=
                Math.log10(Math.max(1, zoom.value)) *
                -sign *
                // reduced amplification for small deltas (small movements on a trackpad)
                Math.min(1, absDelta / 20);
            return getNormalizedZoom(newZoom);
        });
    }

    if (!isZoom) {
        const lockX = e.shiftKey && !e.metaKey;
        if (lockX) {
            setOrigin((v) => ({
                x: v.x + deltaX * rate,
            }));
        } else {
            setOrigin((v) => ({
                x: v.x + deltaX * rate,
                y: v.y + deltaY * rate,
            }));
        }
    }
}

type CanvasProperties = {
    width: number;
    height: number;
    origin: Point;
    zoom: NormalizedZoomValue;
};
function Home() {
    const [gridSpace, setGridSpace] = useState(20);
    const [canvasProperties, setCanvasProperties] = useState<CanvasProperties>({
        width: window.innerWidth || 300,
        height: window.innerHeight || 150,
        origin: {
            x: 0,
            y: 0,
        },
        zoom: 1 as NormalizedZoomValue,
    });

    let canvasRef = useRef<HTMLCanvasElement>(null);

    const setOrigin = (o: (v: Point) => Partial<Point>) => {
        setCanvasProperties((v) => ({
            ...v,
            origin: {
                ...v.origin,
                ...o(v.origin),
            },
        }));
    };

    const setZoom = (o: (v: number) => NormalizedZoomValue) => {
        setCanvasProperties((v) => ({
            ...v,
            zoom: o(v.zoom),
        }));
    };

    const draw = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx && canvasRef.current) {
            const { origin, zoom, width, height } = canvasProperties;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.save();
            console.log("origin zoom: ", origin, zoom);

            // clear background
            ctx.save();
            ctx.clearRect(0, 0, width, height);
            ctx.restore();

            ctx.setTransform(1, 0, 0, 1, origin.x, origin.y);
            ctx.scale(zoom, zoom);

            drawGrids(ctx, canvasProperties, { gridSpace });

            // Some test element in the canvas
            ctx.save();
            ctx.strokeStyle = "#000";
            ctx.strokeRect(0, 0, 100, 100);

            ctx.strokeStyle = "#000";
            ctx.strokeRect(60, 20, 20, 20);
            ctx.strokeRect(20, 20, 20, 20);
            ctx.strokeRect(20, 55, 60, 20);

            ctx.strokeStyle = "#000";
            ctx.strokeRect(0, 0, 2, 2);
            ctx.restore();

            ctx.restore();
        }
    }, [canvasProperties, gridSpace]);

    // Sync canvas
    useEffect(() => {
        draw();
    }, [draw]);

    // add event handlers
    useEffect(() => {
        let canvas = canvasRef.current;

        const _wheelHandler = (e: WheelEvent) =>
            wheelHandler(e, setOrigin, setZoom);

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
        window.addEventListener("resize", _resizeHandler);
        return () => {
            window.removeEventListener("resize", _resizeHandler);
        };
    }, []);

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
                            setZoom(() => getNormalizedZoom(0.75));
                        }}
                    >
                        |zoom .75|
                    </button>
                    <button
                        onClick={() => {
                            setZoom(() => getNormalizedZoom(1.5));
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
