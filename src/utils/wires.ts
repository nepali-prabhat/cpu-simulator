import { WIRES_SNAP_DISTANCE } from "@/constants/constants";
import { WireHighlights, Point, Wire, BoundingBox } from "@/types";
import { isPointInsideBox } from "./box";
import { lengthSquared, projectPointToSegment } from "@/utils";

export function getWiresIntersectingBox(wires: Wire[], box: BoundingBox) {
    let intersectingWires: Wire[] = [];
    let intersectingWireIds: string[] = [];
    for (let wire of wires) {
        if (
            isPointInsideBox(wire.points[0], box) &&
            isPointInsideBox(wire.points[1], box)
        ) {
            intersectingWires.push(wire);
            intersectingWireIds.push(wire.uid);
        }
    }
    return {
        intersectingWires,
        intersectingWireIds,
    };
}

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

            const pushWire = projectionLengthSquared <= WIRES_SNAP_DISTANCE;
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
