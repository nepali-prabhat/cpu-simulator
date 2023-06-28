import {
    applyToPoints,
    rotate,
    translate,
    compose,
    Matrix,
} from "transformation-matrix";

import { COLOR_PALETTE } from "@/colors";
import {
    DEBUG_BOUNDING_BOX,
    PIN_HEIGHT,
    PIN_LENGTH,
} from "@/constants/constants";
import { elementsInfo } from "@/constants/elementsInfo";
import {
    BoundingBox,
    BoundingRect,
    CanvasProperties,
    Dimension,
    Element,
    ElementConfig,
    ElementType,
    GhostElement,
    PinType,
} from "@/types";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Options } from "roughjs/bin/core";
import { getRectangleFromDiagonals as getRectFromDiagonals } from "@/utils";

type GatesRenderer2 = (props: {
    rc: RoughCanvas;
    option: {
        config: Options;
        configWithFill: Options;
        context: CanvasRenderingContext2D;
        elementConfig: ElementConfig;
    };
}) => void;

function getEffectiveDimension({
    type,
    inputsCount = 1,
}: {
    type: ElementType;
    inputsCount?: number;
}) {
    const info = elementsInfo.get(type);
    if (!info) {
        return;
    }

    const evenInputsCount = inputsCount - (inputsCount % 2);
    const effectiveInputPinsCount = evenInputsCount * 2;
    const effectivePinsHeight = effectiveInputPinsCount * PIN_HEIGHT;
    const padding = PIN_HEIGHT * 1;
    const height = Math.max(info.height, padding + effectivePinsHeight);
    let width = info.width + PIN_LENGTH * 2;
    return {
        width,
        height,
    };
}

function getPinsBoundingBox({
    elementConfig,
}: {
    elementConfig: ElementConfig;
}) {
    const rv: {
        pins: (BoundingBox & {
            type: PinType;
            negate?: boolean;
            pinIndex: number;
        })[];
        lines: { x: number; y: number; x1: number; y1: number }[];
    } = {
        pins: [],
        lines: [],
    };
    const info = elementsInfo.get(elementConfig.type);
    if (!elementConfig || !info) {
        return rv;
    }
    const effectiveDimension = getEffectiveDimension({
        type: elementConfig.type,
        inputsCount: elementConfig.inputsCount,
    });
    if (!effectiveDimension) {
        return rv;
    }
    const { height } = effectiveDimension;
    // make output gate
    switch (elementConfig.type) {
        default: {
            // TODO: make this dynamic
            if (info.negateOutputPins?.includes(0)) {
                rv.pins.push({
                    type: "output",
                    negate: true,
                    pinIndex: 0,
                    x: info.width + PIN_LENGTH + PIN_HEIGHT / 2,
                    y: height / 2 - PIN_HEIGHT / 2 + PIN_LENGTH / 2,
                    width: PIN_LENGTH,
                    height: PIN_HEIGHT,
                });
            } else {
                rv.pins.push({
                    type: "output",
                    pinIndex: 0,
                    x: info.width + PIN_LENGTH,
                    y: height / 2 - PIN_HEIGHT / 2,
                    width: PIN_LENGTH,
                    height: PIN_HEIGHT,
                });
            }
            break;
        }
    }
    const midPoint = height / 2;
    const numberOfPins = elementConfig.inputsCount || 1;
    // make input gate
    switch (elementConfig.type) {
        default: {
            const edgePinCount = Math.floor(numberOfPins / 2);
            if (edgePinCount * 2 !== numberOfPins) {
                // middle pin
                rv.pins.push({
                    type: "input",
                    pinIndex: edgePinCount,
                    x: 0,
                    y: midPoint - PIN_HEIGHT / 2,
                    width: PIN_LENGTH,
                    height: PIN_HEIGHT,
                });
            }
            // edge pins
            for (let i = 1; i <= edgePinCount; i++) {
                // top pin
                rv.pins.push({
                    type: "input",
                    pinIndex: i - 1,
                    x: 0,
                    y: midPoint - PIN_HEIGHT * i * 2 - PIN_HEIGHT / 2,
                    width: PIN_LENGTH,
                    height: PIN_HEIGHT,
                });
                // bottom pin
                rv.pins.push({
                    type: "input",
                    pinIndex: edgePinCount + i - 1,
                    x: 0,
                    y: midPoint + PIN_HEIGHT * i * 2 - PIN_HEIGHT / 2,
                    width: PIN_LENGTH,
                    height: PIN_HEIGHT,
                });
                // top pin lines
                if (i !== 1) {
                    rv.lines.push({
                        x: PIN_LENGTH,
                        y: midPoint - PIN_HEIGHT * i * 2 + PIN_HEIGHT / 2,
                        x1: PIN_LENGTH,
                        y1: midPoint - PIN_HEIGHT * i * 2 + PIN_HEIGHT * 2,
                    });
                }
                // bottom pin lines
                if (i !== edgePinCount) {
                    rv.lines.push({
                        x: PIN_LENGTH,
                        y: midPoint + PIN_HEIGHT * i * 2 + PIN_HEIGHT / 2,

                        x1: PIN_LENGTH,
                        y1: midPoint + PIN_HEIGHT * i * 2 + PIN_HEIGHT * 2,
                    });
                }
            }

            break;
        }
    }
    return rv;
}

function transformRect({
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

function renderGateTop({
    context,
    rc,
    path,
    options: { config, configWithFill, rotation },
    dimensions: {
        effectiveDimension: { width, height },
        elementDimension,
    },
}: {
    context: CanvasRenderingContext2D;
    rc: RoughCanvas;
    path?: string;
    options: {
        config: Options;
        configWithFill: Options;
        rotation: number;
    };
    dimensions: {
        effectiveDimension: { width: number; height: number };
        elementDimension: { width: number; height: number };
    };
}) {
    context.save();
    if (rotation === 180) {
        context.rotate(Math.PI);
        context.translate(-width, -height);
    }
    if (rotation === 90) {
        context.rotate(Math.PI / 2);
        context.translate(0, -height);
    }
    if (rotation === 270) {
        context.rotate(Math.PI * (3 / 2));
        context.translate(-width, 0);
    }
    context.translate(PIN_LENGTH, height / 2 - elementDimension.height / 2);
    if (path) {
        rc.path(path, config);
        rc.path(path, configWithFill);
    }
    context.restore();
}

export const renderAndGate: GatesRenderer2 = ({
    rc,
    option: { config, configWithFill, context, elementConfig },
}) => { };

export const renderOrGate: GatesRenderer2 = ({
    rc,
    option: { config, configWithFill },
}) => {
    rc?.path(
        "M10 16a2 2 0 1 0 0 4v-4Zm0 4h12v-4H10v4Zm0 24a2 2 0 1 0 0 4v-4Zm0 4h12v-4H10v4Z",
        config
    );
    rc?.path(
        "M18.545 53.159C21.691 48.892 25 42.03 25 32.132c0-10.102-3.446-17.113-6.637-21.422-.011-.015-.06-.091-.065-.274a1.477 1.477 0 0 1 .133-.628 1.027 1.027 0 0 1 .29-.4c3.549.296 7.703.78 10.806 1.535 7.86 1.915 19.239 7.755 22.345 20.832a1.56 1.56 0 0 1 0 .713C48.77 45.534 37.42 51.134 29.527 53.057c-3.038.74-7.084 1.218-10.587 1.516a1.136 1.136 0 0 1-.317-.44 1.624 1.624 0 0 1-.144-.68c.005-.2.057-.282.066-.294Z",
        configWithFill
    );
};

export const renderNotGate: GatesRenderer2 = ({
    rc,
    option: { config, configWithFill },
}) => {
    rc?.path("M9 30a2 2 0 1 0 0 4v-4Zm0 4h10v-4H9v4Z", config);
    rc?.path(
        "M44.898 33.664 20.11 50.19C18.78 51.076 17 50.123 17 48.526V15.474c0-1.597 1.78-2.55 3.11-1.664l24.788 16.526a2 2 0 0 1 0 3.328Z",
        configWithFill
    );
    rc?.circle(53, 32, 6, config);
};

export const renderNandGate: GatesRenderer2 = ({
    rc,
    option: { config, configWithFill },
}) => {
    rc?.path(
        "M49 32c0 12.387-8.073 22-20 22h-8a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2h8c11.927 0 20 9.613 20 22Z",
        configWithFill
    );
    rc?.path(
        "M9 16a2 2 0 1 0 0 4v-4Zm0 4h10v-4H9v4Zm0 24a2 2 0 1 0 0 4v-4Zm0 4h10v-4H9v4Z",
        config
    );
    rc?.circle(56, 32, 6, config);
};

export const renderNorGate: GatesRenderer2 = ({
    rc,
    option: { config, configWithFill },
}) => {
    rc?.path(
        "M9 16a2 2 0 1 0 0 4v-4Zm0 4h9v-4H9v4ZM9 44a2 2 0 1 0 0 4v-4Zm0 4h10v-4H9v4Z",
        config
    );
    rc?.path(
        "M15.545 53.159C18.691 48.892 22 42.03 22 32.132c0-10.102-3.446-17.113-6.637-21.422-.011-.015-.06-.091-.065-.274a1.477 1.477 0 0 1 .133-.628 1.027 1.027 0 0 1 .29-.4c3.549.296 7.703.78 10.806 1.535 7.86 1.915 19.239 7.755 22.345 20.832a1.56 1.56 0 0 1 0 .713C45.77 45.534 34.42 51.134 26.527 53.057c-3.038.74-7.084 1.218-10.587 1.516l-.012-.01a1.136 1.136 0 0 1-.305-.43 1.624 1.624 0 0 1-.144-.68c.005-.2.057-.282.066-.294Z",
        configWithFill
    );
    rc?.circle(56, 32, 6, config);
};

export const renderBuffer: GatesRenderer2 = ({
    rc,
    option: { config, configWithFill },
}) => {
    rc?.path(
        "M49.898 33.664 25.11 50.19C23.78 51.076 22 50.123 22 48.526V15.474c0-1.597 1.78-2.55 3.11-1.664l24.788 16.526a2 2 0 0 1 0 3.328Z",
        configWithFill
    );
    rc?.path("M8 30a2 2 0 1 0 0 4v-4Zm0 4h12v-4H8v4Z", config);
};

export const renderXorGate: GatesRenderer2 = ({
    rc,
    option: { config, configWithFill },
}) => {
    rc?.path(
        "M20.414 53.159c3.145-4.267 6.455-11.128 6.455-21.027 0-10.102-3.446-17.113-6.638-21.422-.01-.015-.058-.091-.064-.274a1.478 1.478 0 0 1 .133-.628c.097-.218.213-.342.28-.393l.01-.007c3.549.296 7.702.78 10.806 1.535 7.86 1.915 19.239 7.755 22.344 20.832a1.56 1.56 0 0 1 0 .713c-3.1 13.046-14.451 18.646-22.344 20.569-3.038.74-7.084 1.218-10.587 1.516a1.136 1.136 0 0 1-.317-.44 1.626 1.626 0 0 1-.144-.68c.005-.2.057-.282.066-.294Z",
        configWithFill
    );
    rc?.path(
        "M13 12c2.933 3.437 6.869 9.945 6.869 20.121 0 10.1-3.877 16.493-6.803 19.879",
        { ...config, fill: "none" }
    );
};

export const renderXnorGate: GatesRenderer2 = ({
    rc,
    option: { config, configWithFill },
}) => {
    rc?.path(
        "M14.414 53.159c3.145-4.267 6.455-11.128 6.455-21.027 0-10.102-3.446-17.113-6.638-21.422-.01-.015-.058-.091-.064-.274a1.477 1.477 0 0 1 .133-.628 1.027 1.027 0 0 1 .29-.4c3.549.296 7.702.78 10.806 1.535 7.86 1.915 19.239 7.755 22.344 20.832a1.56 1.56 0 0 1 0 .713c-3.1 13.046-14.451 18.646-22.344 20.569-3.038.74-7.084 1.218-10.587 1.516a1.136 1.136 0 0 1-.317-.44 1.626 1.626 0 0 1-.144-.68c.005-.2.057-.282.066-.294Z",
        configWithFill
    );
    rc?.path(
        "M7 12c2.933 3.437 6.869 9.945 6.869 20.121 0 10.1-3.877 16.493-6.803 19.879",
        { ...config, fill: "none" }
    );
    rc?.circle(56, 32, 6, config);
};

export const renderMux: GatesRenderer2 = ({
    rc,
    option: { config, configWithFill, context },
}) => {
    rc?.path(
        "M16 13.772c0-2.793 2.79-4.726 5.404-3.745l24 9A4 4 0 0 1 48 22.772v18.456a4 4 0 0 1-2.596 3.745l-24 9c-2.614.98-5.404-.952-5.404-3.745V13.772Z",
        configWithFill
    );
    rc?.path(
        "M48 29h-2v4h2v-4Zm8 4a2 2 0 1 0 0-4v4Zm-8 0h8v-4h-8v4ZM8 16a2 2 0 1 0 0 4v-4Zm0 4h8v-4H8v4ZM8 44a2 2 0 1 0 0 4v-4Zm0 4h8v-4H8v4Z",
        config
    );
    context.fillText("mux", 32, 58);
};

export const renderDmux: GatesRenderer2 = ({
    rc,
    option: { config, configWithFill, context },
}) => {
    rc?.path(
        "M16 35h2v-4h-2v4Zm-8-4a2 2 0 1 0 0 4v-4Zm8 0H8v4h8v-4ZM56 48a2 2 0 1 0 0-4v4Zm0-4h-8v4h8v-4ZM56 20a2 2 0 1 0 0-4v4Zm0-4h-8v4h8v-4Z",
        config
    );
    rc?.path(
        "M48 50.228c0 2.793-2.79 4.726-5.404 3.745l-24-9A4 4 0 0 1 16 41.228V22.772a4 4 0 0 1 2.596-3.745l24-9c2.615-.98 5.404.952 5.404 3.745v36.456Z",
        configWithFill
    );
    context.fillText("dmux", 5, 58);
};

export const renderDecoder: GatesRenderer2 = ({
    rc,
    option: { config, configWithFill, context },
}) => {
    rc?.path(
        "M16 13.772c0-2.793 2.79-4.726 5.404-3.745l24 9A4 4 0 0 1 48 22.772v18.456a4 4 0 0 1-2.596 3.745l-24 9c-2.614.98-5.404-.952-5.404-3.745V13.772Z",
        { ...config, fill: "white", fillStyle: "solid" }
    );
    rc?.path(
        "M16 13.772c0-2.793 2.79-4.726 5.404-3.745l24 9A4 4 0 0 1 48 22.772v18.456a4 4 0 0 1-2.596 3.745l-24 9c-2.614.98-5.404-.952-5.404-3.745V13.772Z",
        configWithFill
    );
    rc?.path(
        "M48 29h-2v4h2v-4Zm8 4a2 2 0 1 0 0-4v4Zm-8 0h8v-4h-8v4ZM8 16a2 2 0 1 0 0 4v-4Zm0 4h8v-4H8v4ZM8 44a2 2 0 1 0 0 4v-4Zm0 4h8v-4H8v4Z",
        config
    );
    context.fillText("dec", 32, 58);
};

export const renderDQFlipFlop: GatesRenderer2 = ({
    rc,
    option: { config, configWithFill, context },
}) => {
    rc?.rectangle(16, 8, 32, 48, configWithFill);
    rc?.path("m16 17 6.28 5.495a2 2 0 0 1 0 3.01L16 31", config);
    context.fillText("DQ", 32, 55);
};

export function renderGate({
    element,
    context,
    rc,
}: {
    element: Pick<Element, "nonce" | "type">;
    context: CanvasRenderingContext2D;
    rc: RoughCanvas | null;
}) {
    const config: Options = {
        seed: element.nonce + 1,
        roughness: 0.2,
        fill: "white",
        fillStyle: "solid",
    };
    const fill = "metal";
    const configWithFill: Options = {
        ...config,
        fill,
        fillStyle: "hachure",
        hachureGap: 4,
    };
    const option = {
        config,
        configWithFill,
        context,
    };
    // switch (element.type) {
    //     case "and_gate": {
    //         renderAndGate({ rc, option });
    //         break;
    //     }
    //     case "or_gate": {
    //         renderOrGate({ rc, option });
    //         break;
    //     }
    //     case "not_gate": {
    //         renderNotGate({ rc, option });
    //         break;
    //     }
    //     case "nand_gate": {
    //         renderNandGate({ rc, option });
    //         break;
    //     }
    //     case "nor_gate": {
    //         renderNorGate({ rc, option });
    //         break;
    //     }
    //     case "buffer": {
    //         renderBuffer({ rc, option });
    //         break;
    //     }
    //     case "xor_gate": {
    //         renderXorGate({ rc, option });
    //         break;
    //     }
    //     case "xnor_gate": {
    //         renderXnorGate({ rc, option });
    //         break;
    //     }
    //     case "mux": {
    //         renderMux({ rc, option });
    //         break;
    //     }
    //     case "dmux": {
    //         renderDmux({ rc, option });
    //         break;
    //     }
    //     case "decoder": {
    //         renderDecoder({ rc, option });
    //         break;
    //     }
    //     case "DQ_flip_flop": {
    //         renderDQFlipFlop({ rc, option });
    //         break;
    //     }
    // }
}

export function renderGhostGate({
    element,
    canvasProperties,
    context,
    rc,
}: {
    element: GhostElement;
    canvasProperties: CanvasProperties;
    context: CanvasRenderingContext2D;
    rc: RoughCanvas | null;
}) {
    if (!element?.show || !rc) {
        return;
    }
    const seed = element.seed + 1;
    const roughness = 0.2;
    const hachureGap = 4;
    const bgColor = canvasProperties.bgColor || "#fff";
    const elementColor = element.elementConfig.color || "#000";
    const debugConfig = {
        seed,
        roughness,
        fill: undefined,
        stroke: COLOR_PALETTE.blue[1],
    };

    const elementConfig = element.elementConfig;
    const info = elementsInfo.get(elementConfig.type);
    const effectiveDimension = getEffectiveDimension({
        type: elementConfig.type,
        inputsCount: elementConfig.inputsCount,
    });
    if (!info || !effectiveDimension) {
        return;
    }

    // Transformation matrices
    const tm = makeTransformationMatrix({
        elementConfig,
        effectiveDimension,
    });
    const tmIcon = compose(
        tm,
        translate(PIN_LENGTH, effectiveDimension.height / 2 - info.height / 2)
    );

    const transformedDimension = transformRect({
        tm,
        rect: [0, 0, effectiveDimension.width, effectiveDimension.height],
    });

    const { pins, lines } = getPinsBoundingBox({
        elementConfig,
    });
    const transformedPins = pins.map((pin) => ({
        rect: transformRect({ tm, rect: convertBoxToRect(pin) }),
        originalPin: pin,
    }));

    const gateIconRect: BoundingRect = [0, 0, info.width, info.height];
    const iconBoundingRect = transformRect({
        tm: tmIcon,
        rect: gateIconRect,
    });

    const pinsConfig = {
        seed,
        roughness,
        bowing: 20,
        fill: bgColor,
        fillStyle: "solid",
        stroke: elementColor,
    };
    // render input and outputs
    for (let pin of transformedPins) {
        if (pin.originalPin.negate) {
            const rect = pin.rect;
            rc.circle(rect[0], rect[1], rect[2], pinsConfig);
        } else {
            rc.rectangle(...pin.rect, pinsConfig);
        }
    }

    for (let line of lines) {
        const [p1, p2] = applyToPoints(tm, [
            {
                x: line.x,
                y: line.y,
            },
            {
                x: line.x1,
                y: line.y1,
            },
        ]);
        rc.line(p1.x, p1.y, p2.x, p2.y, pinsConfig);
    }

    const gateConfig = {
        bgConfig: {
            seed,
            roughness,
            fill: bgColor,
            fillStyle: "solid",
            stroke: elementColor,
        },
        fgConfig: {
            seed,
            roughness,
            fill: elementColor,
            fillStyle: "hachure",
            hachureGap,
            stroke: elementColor,
        },
    };
    if (info.path) {
        context.save();
        context.transform(
            tmIcon.a,
            tmIcon.b,
            tmIcon.c,
            tmIcon.d,
            tmIcon.e,
            tmIcon.f
        );
        renderGateIcon({
            rc,
            path: info.path,
            config: gateConfig,
        });
        context.restore();
    } else {
        rc.rectangle(...iconBoundingRect, {
            seed,
            roughness,
            fill: bgColor,
            fillStyle: "solid",
            stroke: elementColor,
            strokeWidth: 1,
        });
        context.fillText(
            elementConfig.type,
            iconBoundingRect[0],
            iconBoundingRect[1]
        );
    }

    if (DEBUG_BOUNDING_BOX) {
        const rects: BoundingRect[] = [
            transformedDimension,
            // iconBoundingRect
        ];
        rects.forEach((rect) => {
            rc.rectangle(...rect, debugConfig);
        });
    }
}

function renderGateIcon({
    rc,
    path,
    config,
}: {
    rc: RoughCanvas;
    path: string;
    config: {
        bgConfig: Options;
        fgConfig: Options;
    };
}) {
    rc.path(path, config.bgConfig);
    rc.path(path, config.fgConfig);
}

function convertBoxToRect(boundingBox: BoundingBox): BoundingRect {
    const rect: BoundingRect = [
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height,
    ];
    return rect;
}

function makeTransformationMatrix({
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
