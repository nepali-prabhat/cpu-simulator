import { MAX_ZOOM, MIN_ZOOM } from "@/constants";

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
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                    ></path>
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
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                    ></path>
                </svg>
            </button>
        </section>
    );
}
