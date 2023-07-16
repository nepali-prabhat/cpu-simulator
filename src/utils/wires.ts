import { WireHighlights, Point, Wire } from "@/types";

function getDiagonalsOfRectFromPoints(p1: Point, p2: Point) {
    if (p1.x === p2.x && p1.y === p2.y) {
        return;
    }
    let padding = 10;
    const slope = (p2.y - p1.y) / (p2.x - p1.x);
    let diagonals: [Point, Point];
    if (slope < 0) {
        if (p1.x < p2.x && p1.y < p2.y) {
            diagonals = [p1, p2];
        } else {
            diagonals = [p2, p1];
        }
    } else if (slope > 0) {
        let bottomPoint: Point;
        let topPoint: Point;
        if (p1.x < p2.x && p1.y > p2.y) {
            bottomPoint = p1;
            topPoint = p2;
        } else {
            bottomPoint = p2;
            topPoint = p1;
        }
        diagonals = [
            {
                x: bottomPoint.x,
                y: topPoint.y,
            },
            {
                x: topPoint.x,
                y: bottomPoint.y,
            },
        ];
    } else {
        diagonals = [
            {
                x: Math.min(p1.x, p2.x),
                y: Math.min(p1.y, p2.y),
            },
            {
                x: Math.max(p1.x, p2.x),
                y: Math.max(p1.y, p2.y),
            },
        ];
    }
    diagonals = [
        {
            x: diagonals[0].x - padding,
            y: diagonals[0].y - padding,
        },
        {
            x: diagonals[1].x + padding,
            y: diagonals[1].y + padding,
        },
    ];
    return diagonals;
}

function lengthSquared(p1: Point, p2: Point): number {
    const deltaX = p2.x - p1.x;
    const deltaY = p2.y - p1.y;
    return deltaX * deltaX + deltaY * deltaY;
}

// http://paulbourke.net/geometry/pointlineplane/
function projectPointToSegment(p: Point, segmentP1: Point, segmentP2: Point) {
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

function minDistToSegmentSquared(p: Point, segmentP1: Point, segmentP2: Point) {
    var l2 = lengthSquared(segmentP1, segmentP2);
    if (l2 == 0) return lengthSquared(p, segmentP1);
    return lengthSquared(p, projectPointToSegment(p, segmentP1, segmentP2));
}

/* function minDistToSegment(p: Point, segmentP1: Point, segmentP2: Point) {
    return Math.sqrt(minDistToSegmentSquared(p, segmentP1, segmentP2));
} */

export function getWiresAt(coordinates: Point, wires: Wire[]) {
    let wireHighlights: WireHighlights = [];
    let intersectedWires: Wire[] = [];
    for (let wire of wires) {
        for (let i = 0; i < wire.points.length - 1; i++) {
            const p1 = wire.points[i];
            const p2 = wire.points[i + 1];

            const wireLengthSquared = lengthSquared(p1, p2);
            const projectedPoint = projectPointToSegment(coordinates, p1, p2);
            const projectionLengthSquared =
                wireLengthSquared === 0
                    ? lengthSquared(coordinates, p1)
                    : lengthSquared(coordinates, projectedPoint);

            const pushWire = projectionLengthSquared <= 49;
            if (pushWire) {
                intersectedWires.push(wire);
                wireHighlights.push({
                    uid: wire.uid,
                    projectedPoint,
                    length: projectionLengthSquared,
                });
            }
        }
    }
    return {
        wires: intersectedWires,
        wireHighlights,
    };
}
