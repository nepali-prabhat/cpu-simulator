import { MAX_ZOOM, MIN_ZOOM } from "@/constants/constants";

import { useAtomValue, useSetAtom } from "jotai";
import { setViewportZoom, zoomValueAtom } from "@/state/scene";

export function Footer() {
    const setZoom = useSetAtom(setViewportZoom);
    const zoom = useAtomValue(zoomValueAtom);

    return (
        <section className="flex absolute bottom-0 left-0 justify-center items-stretch py-1 px-1.5 m-1 bg-white rounded-tr-lg border border-gray-300">
            <button
                className="p-2.5 rounded-lg hover:bg-gray-200 focus:bg-gray-200"
                onClick={(e) => {
                    const zoom = e.shiftKey ? 0.5 : 0.1;
                    setZoom((v) => v - zoom);
                }}
                disabled={zoom <= MIN_ZOOM}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    width="1em"
                    height="1em"
                >
                    <path d="M432 256c0 22.094-17.906 40-40 40H56c-22.094 0-40-17.906-40-40s17.906-40 40-40h336c22.094 0 40 17.906 40 40Z" />
                </svg>
            </button>
            <button
                onClick={() => setZoom(1)}
                className="flex justify-center items-center px-2.5 mx-0.5 text-sm rounded-lg outline-2"
            >
                {Math.floor(zoom * 100)} %
            </button>
            <button
                onClick={(e) => {
                    const zoom = e.shiftKey ? 0.5 : 0.1;
                    setZoom((v) => v + zoom);
                }}
                disabled={zoom >= MAX_ZOOM}
                className="p-2.5 rounded-lg hover:bg-gray-200 focus:bg-gray-200 outline-2"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    width="1em"
                    height="1em"
                >
                    <path d="M432 256c0 22.094-17.906 40-40 40H264v128c0 22.094-17.906 40-40 40s-40-17.906-40-40V296H56c-22.094 0-40-17.906-40-40s17.906-40 40-40h128V88c0-22.094 17.906-40 40-40s40 17.906 40 40v128h128c22.094 0 40 17.906 40 40Z" />
                </svg>
            </button>
        </section>
    );
}
