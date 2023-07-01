import { BoundingRect, Dimension, ElementConfig, Point } from "@/types";
import {
    Matrix,
    applyToPoints,
    compose,
    rotate,
    scale,
    translate,
} from "transformation-matrix";
import { getRectFromDiagonals } from "./box";

export function makeTransformationMatrix({
    elementConfig,
    effectiveDimension,
}: {
    elementConfig: ElementConfig;
    position?: Point;
    effectiveDimension: Dimension;
}): Matrix {
    const { width, height } = effectiveDimension;
    let transformations: Matrix[] = [];
    transformations.push(scale(elementConfig.scale || 1));
    switch (elementConfig.rotation) {
        case 90: {
            transformations.push(rotate(Math.PI / 2), translate(0, -height));
            break;
        }
        case 180: {
            transformations.push(rotate(Math.PI), translate(-width, -height));
            break;
        }
        case 270: {
            transformations.push(
                rotate(Math.PI * (3 / 2)),
                translate(-width, 0)
            );
            break;
        }
        default: {
            transformations.push(rotate(0));
        }
    }
    return compose(transformations);
}

export function transformRect({
    tm,
    rect,
}: {
    tm: Matrix;
    rect: BoundingRect;
}): BoundingRect {
    const [d1, d2] = applyToPoints(tm, [
        { x: rect[0], y: rect[1] },
        { x: rect[0] + rect[2], y: rect[1] + rect[3] },
    ]);
    return getRectFromDiagonals(d1, d2);
}
