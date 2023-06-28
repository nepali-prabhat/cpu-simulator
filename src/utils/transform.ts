import { BoundingRect, Dimension, ElementConfig } from "@/types";
import {
    Matrix,
    applyToPoints,
    compose,
    rotate,
    translate,
} from "transformation-matrix";
import { getRectFromDiagonals } from "./box";

export function makeTransformationMatrix({
    elementConfig,
    effectiveDimension,
}: {
    elementConfig: ElementConfig;
    effectiveDimension: Dimension;
}): Matrix {
    const { width, height } = effectiveDimension;
    let tm: Matrix = compose(rotate(0));
    if (elementConfig.rotation === 180) {
        tm = compose(rotate(Math.PI), translate(-width, -height));
    }
    if (elementConfig.rotation === 90) {
        tm = compose(rotate(Math.PI / 2), translate(0, -height));
    }
    if (elementConfig.rotation === 270) {
        tm = compose(rotate(Math.PI * (3 / 2)), translate(-width, 0));
    }
    return tm;
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
