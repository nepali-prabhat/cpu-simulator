"use client";
import { useCanvas } from "@/components/canvas/useCanvas";
import { getNormalizedZoom, getStateForZoom } from "@/components/canvas/zoom";
import { MAX_ZOOM, MIN_ZOOM } from "@/constants";
import dynamic from "next/dynamic";

function Home() {
    const { canvasRef, canvasProperties, handleCanvasContextMenu, setZoom } =
        useCanvas({});

    return (
        <main className={`relative w-screen h-screen overflow-hidden`}>
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
            <section className="absolute bottom-1 left-1">
                <div className="flex">
                    <button
                        onClick={(e) => {
                            const zoom = e.shiftKey ? .5 : 0.1;
                            setZoom((v) =>
                                getStateForZoom(
                                    {
                                        viewportX: canvasProperties.width / 2,
                                        viewportY: canvasProperties.height / 2,
                                        nextZoom: getNormalizedZoom(v - zoom),
                                    },
                                    canvasProperties
                                )
                            );
                        }}
                        disabled={canvasProperties.zoom <= MIN_ZOOM}
                        className="flex justify-center items-center p-2 rounded-tl rounded-bl"
                    >
                        - |
                    </button>
                    <button
                        onClick={() => {
                            setZoom(() =>
                                getStateForZoom(
                                    {
                                        viewportX: canvasProperties.width / 2,
                                        viewportY: canvasProperties.height / 2,
                                        nextZoom: getNormalizedZoom(1),
                                    },
                                    canvasProperties
                                )
                            );
                        }}
                        className="flex justify-center items-center px-2"
                    >
                        {Math.floor(canvasProperties.zoom * 100)} %
                    </button>
                    <button
                        onClick={(e) => {
                            const zoom = e.shiftKey ? .5 : 0.1;
                            setZoom((v) =>
                                getStateForZoom(
                                    {
                                        viewportX: canvasProperties.width / 2,
                                        viewportY: canvasProperties.height / 2,
                                        nextZoom: getNormalizedZoom(v + zoom),
                                    },
                                    canvasProperties
                                )
                            );
                        }}
                        disabled={canvasProperties.zoom >= MAX_ZOOM}
                        className="flex justify-center items-center p-2 rounded-tr rounded-br"
                    >
                        | +
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
