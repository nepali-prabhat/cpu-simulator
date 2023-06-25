import {
    PIN_HEIGHT,
    PIN_LENGTH,
    PIN_MID_POINT_GAP,
} from "@/constants/constants";
import { elementsInfo } from "@/constants/elementsInfo";
import {
    CanvasProperties,
    Element,
    ElementConfig,
    ElementType,
    GhostElement,
} from "@/types";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Options } from "roughjs/bin/core";

type GatesRenderer = (props: {
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
    const evenInputsCount = inputsCount + (inputsCount % 2);
    const effectiveInputPinsCount = evenInputsCount * 2;
    const effectivePinsHeight = effectiveInputPinsCount * PIN_HEIGHT;
    const padding = Math.max(info.height - PIN_HEIGHT * 4, 4);
    return {
        width: info.width + PIN_LENGTH * 2,
        height: padding + effectivePinsHeight,
    };
}

function renderGateTop({
    rc,
    path,
    config,
    configWithFill,
}: {
    rc: RoughCanvas;
    path?: string;
    config: Options;
    configWithFill: Options;
}) {
    if (path) {
        rc.path(path, config);
        rc.path(path, configWithFill);
    }
}

export const renderAndGate: GatesRenderer = ({
    rc,
    option: { config, configWithFill, context, elementConfig },
}) => {
    const effectiveDimension = getEffectiveDimension({
        type: elementConfig.type,
        inputsCount: elementConfig.inputsCount,
    });
    const info = elementsInfo.get(elementConfig.type);
    if (!info || !effectiveDimension) {
        return;
    }
    const { width, height } = effectiveDimension;
    // BUG: use this to debug zoom in offset bug
    // rc.rectangle(
    //     0,
    //     0,
    //     effectiveDimension?.width,
    //     effectiveDimension?.height,
    //     configWithFill
    // );
    context.save();
    context.translate(PIN_LENGTH, height / 2 - info.height / 2);
    // AND Gate
    renderGateTop({
        rc,
        path: "M43 32C43 48.8201 32.0851 62 15.8824 62H4C2.89543 62 2 61.1046 2 60V4C2 2.89543 2.89543 2 4 2H15.8824C32.0851 2 43 15.1799 43 32Z",
        config,
        configWithFill,
    });
    context.restore();
    // Output pin
    rc.rectangle(
        info.width + PIN_LENGTH,
        height / 2 - PIN_HEIGHT / 2,
        PIN_LENGTH,
        PIN_HEIGHT,
        config
    );
    rc.line(PIN_LENGTH, 0, PIN_LENGTH, height, {...config, roughness:0.5});
    const midPoint = height / 2;
    const numberOfPins = elementConfig.inputsCount || 0;
    for (let i = 0; i < Math.ceil(numberOfPins / 2); i++) {
        rc.rectangle(
            0,
            midPoint - PIN_HEIGHT * (i + 1) * 2,
            PIN_LENGTH,
            PIN_HEIGHT,
            config
        );
    }
    for (let i = 0; i < Math.floor(numberOfPins / 2); i++) {
        rc.rectangle(
            0,
            midPoint + PIN_HEIGHT * (i + 1) * 2 - PIN_HEIGHT / 2,
            PIN_LENGTH,
            PIN_HEIGHT,
            config
        );
    }
};

export const renderOrGate: GatesRenderer = ({
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

export const renderNotGate: GatesRenderer = ({
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

export const renderNandGate: GatesRenderer = ({
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

export const renderNorGate: GatesRenderer = ({
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

export const renderBuffer: GatesRenderer = ({
    rc,
    option: { config, configWithFill },
}) => {
    rc?.path(
        "M49.898 33.664 25.11 50.19C23.78 51.076 22 50.123 22 48.526V15.474c0-1.597 1.78-2.55 3.11-1.664l24.788 16.526a2 2 0 0 1 0 3.328Z",
        configWithFill
    );
    rc?.path("M8 30a2 2 0 1 0 0 4v-4Zm0 4h12v-4H8v4Z", config);
};

export const renderXorGate: GatesRenderer = ({
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

export const renderXnorGate: GatesRenderer = ({
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

export const renderMux: GatesRenderer = ({
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

export const renderDmux: GatesRenderer = ({
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

export const renderDecoder: GatesRenderer = ({
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

export const renderDQFlipFlop: GatesRenderer = ({
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
    const config: Options = {
        seed: element.seed + 1,
        roughness: 0.2,
        fill: canvasProperties.bgColor || "white",
        // stroke: element.elementConfig.color,
        fillStyle: "solid",
    };
    const configWithFill: Options = {
        ...config,
        fill: element.elementConfig.color,
        fillStyle: "hachure",
        // stroke: element.elementConfig.color,
        hachureGap: 4,
    };
    const option = {
        config,
        configWithFill,
        context,
        elementConfig: element.elementConfig,
    };
    console.log("element: ", element);
    switch (element.elementConfig.type) {
        case "and_gate": {
            renderAndGate({ rc, option });
            break;
        }
        case "or_gate": {
            renderOrGate({ rc, option });
            break;
        }
        case "not_gate": {
            renderNotGate({ rc, option });
            break;
        }
        case "nand_gate": {
            renderNandGate({ rc, option });
            break;
        }
        case "nor_gate": {
            renderNorGate({ rc, option });
            break;
        }
        case "buffer": {
            renderBuffer({ rc, option });
            break;
        }
        case "xor_gate": {
            renderXorGate({ rc, option });
            break;
        }
        case "xnor_gate": {
            renderXnorGate({ rc, option });
            break;
        }
        case "mux": {
            renderMux({ rc, option });
            break;
        }
        case "dmux": {
            renderDmux({ rc, option });
            break;
        }
        case "decoder": {
            renderDecoder({ rc, option });
            break;
        }
        case "DQ_flip_flop": {
            renderDQFlipFlop({ rc, option });
            break;
        }
    }
}
