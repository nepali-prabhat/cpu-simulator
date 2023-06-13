import { MAX_ZOOM, MIN_ZOOM } from "@/constants";

import { useAtomValue, useSetAtom } from "jotai";
import { setViewportZoom, zoomValueAtom } from "@/state/scene";

export function Footer() {
    const setZoom = useSetAtom(setViewportZoom);
    const zoom = useAtomValue(zoomValueAtom);

    return (
                    <section className="absolute bottom-1 left-1">
        <div className="flex">
            <button
                onClick={(e) => {
                    const zoom = e.shiftKey ? 0.5 : 0.1;
                    setZoom((v) => v - zoom);
                }}
                disabled={zoom <= MIN_ZOOM}
                className="flex justify-center items-center p-2 rounded-tl rounded-bl"
            >
                - |
            </button>
            <button
                onClick={() => setZoom(1)}
                className="flex justify-center items-center px-2"
            >
                {Math.floor(zoom * 100)} %
            </button>
            <button
                onClick={(e) => {
                    const zoom = e.shiftKey ? 0.5 : 0.1;
                    setZoom((v) => v + zoom);
                }}
                disabled={zoom >= MAX_ZOOM}
                className="flex justify-center items-center p-2 rounded-tr rounded-br"
            >
                | +
            </button>
        </div>
        </section>
    );
}
