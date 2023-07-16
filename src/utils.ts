import { GRID_SPACE, MAX_ZOOM, MIN_ZOOM } from "./constants/constants";
import { NormalizedZoomValue, Point } from "./types";

export function mergeRefs<T = any>(
    refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>
): React.RefCallback<T> {
    return (value) => {
        refs.forEach((ref) => {
            if (typeof ref === "function") {
                ref(value);
            } else if (ref != null) {
                (ref as React.MutableRefObject<T | null>).current = value;
            }
        });
    };
}

// Utility functions for scene
export function getNormalizedZoom(zoom: number): NormalizedZoomValue {
    return Math.max(MIN_ZOOM, Math.min(zoom, MAX_ZOOM)) as NormalizedZoomValue;
}

export function getGridPoint(
    x: number,
    y: number,
    gridSize: number | null = GRID_SPACE
): [number, number] {
    if (gridSize) {
        return [
            Math.round(x / gridSize) * gridSize,
            Math.round(y / gridSize) * gridSize,
        ];
    }
    return [x, y];
}

export function areSamePoints(p1: Point, p2: Point) {
    return p1.x === p2.x && p1.y === p2.y;
}

export function convertTupleToPoint(tuple: [number, number]) {
    return { x: tuple[0], y: tuple[1] };
}

export function convertPointToTuple(point: Point): [number, number] {
    return [point.x, point.y];
}

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
export function getPointOfIntersection(
    p1: Point,
    p2: Point,
    p3: Point,
    p4: Point
): Point | false {
    // Check if none of the lines are of length 0
    if ((p1.x === p2.x && p1.y === p2.y) || (p3.x === p4.x && p3.y === p4.y)) {
        return false;
    }

    const denominator =
        (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);

    // Lines are parallel
    if (denominator === 0) {
        return false;
    }

    let ua =
        ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
        denominator;
    let ub =
        ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
        denominator;

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return false;
    }

    // Return an object with the x and y coordinates of the intersection
    let x = p1.x + ua * (p2.x - p1.x);
    let y = p1.y + ua * (p2.y - p1.y);

    return { x, y };
}

export function lengthSquared(p1: Point, p2: Point): number {
    const deltaX = p2.x - p1.x;
    const deltaY = p2.y - p1.y;
    return deltaX * deltaX + deltaY * deltaY;
}

// http://paulbourke.net/geometry/pointlineplane/
export function projectPointToSegment(
    p: Point,
    segmentP1: Point,
    segmentP2: Point
) {
    var l2 = lengthSquared(segmentP1, segmentP2);
    if (l2 == 0) return segmentP1;
    var t =
        ((p.x - segmentP1.x) * (segmentP2.x - segmentP1.x) +
            (p.y - segmentP1.y) * (segmentP2.y - segmentP1.y)) /
        l2;
    t = Math.max(0, Math.min(1, t));
    return {
        x: segmentP1.x + t * (segmentP2.x - segmentP1.x),
        y: segmentP1.y + t * (segmentP2.y - segmentP1.y),
    };
}

export function minDistToSegmentSquared(
    p: Point,
    segmentP1: Point,
    segmentP2: Point
) {
    var l2 = lengthSquared(segmentP1, segmentP2);
    if (l2 == 0) return lengthSquared(p, segmentP1);
    return lengthSquared(p, projectPointToSegment(p, segmentP1, segmentP2));
}
