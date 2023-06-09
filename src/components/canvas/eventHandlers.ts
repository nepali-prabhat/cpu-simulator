import { ZOOM_STEP } from "@/constants";
import { CanvasProperties, Point } from "@/types";
import { getNormalizedZoom, getStateForZoom } from "./zoom";

export function wheelHandler(
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
