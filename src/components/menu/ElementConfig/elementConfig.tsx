import { ElementConfig as ElementConfigType } from "@/types";
import { paletteWidth } from "@/constants/constants";
import { elementConfigAtomAtom } from "@/state/ui";
import { PrimitiveAtom, WritableAtom, useAtom, useAtomValue } from "jotai";
import { elementsInfo, maxBitsSupported } from "@/constants/elementsInfo";
import clsx from "clsx";
import { ChangeEvent, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { elementsIconMap } from "../elements/elements";
import { ColorPicker } from "@/components/colorPicker/colorPicker";
import { ELEMENTS_COLOR_PALETTE } from "@/colors";
import { useObservePaletteHeight } from "@/utils/hooks/useObservePaletteHeight";
import { validator } from "./validator";
import { selectedElementConfigAtomAtom } from "@/state/elements";

type ElementConfigPropType = {};

const inputConstants: {
    [key in keyof ElementConfigType]: { label: string; name: key; id: string };
} = {
    type: { label: "Type", name: "type", id: "element-config-input-type" },
    inputsCount: {
        label: "Inputs count",
        name: "inputsCount",
        id: "element-config-input-inputs-count",
    },
    selectBits: {
        label: "Select bits",
        name: "selectBits",

        id: "element-config-input-select-bits",
    },
    dataBits: {
        label: "Data bits",
        name: "dataBits",
        id: "element-config-input-data-bits",
    },
    rotation: {
        label: "Direction",
        name: "rotation",
        id: "element-config-input-rotation",
    },
    scale: {
        label: "Size",
        name: "scale",
        id: "element-config-input-scale",
    },
    color: {
        label: "Color",
        name: "color",
        id: "element-config-input-color",
    },
};

const ElementConfigSection = (
    props: ElementConfigPropType & {
        configAtom:
        | PrimitiveAtom<ElementConfigType>
        | WritableAtom<
            ElementConfigType,
            [value: (v: ElementConfigType) => ElementConfigType],
            void
        >;
    }
) => {
    const [config, setConfig] = useAtom(props.configAtom);
    const [transientValue, setTransientValue] = useState<{
        [key in keyof ElementConfigType]?: {
            error?: string[];
            value: ElementConfigType[key];
        };
    }>({});
    const { top } = useObservePaletteHeight();

    useEffect(() => {
        setTransientValue({});
    }, [config?.type]);

    function handleChange<T extends keyof ElementConfigType>(
        {
            name,
            label,
            inputValue,
            formattedValue,
        }: {
            label: string;
            name: T;
            inputValue?: any;
            formattedValue: ElementConfigType[T];
        },
        e?: ChangeEvent<HTMLInputElement>
    ) {
        inputValue = inputValue || e?.target.value;
        const errorState = validator({
            name,
            label,
            value: inputValue,
            maxValue: e?.target.max ? +e.target.max : undefined,
            minValue: e?.target.min ? +e.target.min : undefined,
        });
        setTransientValue((v) => ({
            ...v,
            [name]: {
                error: errorState.hasError ? errorState.errors : undefined,
                value: errorState.hasError ? inputValue : formattedValue,
            },
        }));
        if (!errorState.hasError) {
            setConfig((v) => ({
                ...v,
                [name]: formattedValue,
            }));
        }
    }

    /* function handleBlur<T extends keyof ElementConfigType>({
        name,
    }: {
        name: T;
    }) {
        if (!transientValue[name]?.error) {
            setConfig((v) => ({
                ...v,
                [name]: transientValue[name]?.value || v[name],
            }));
        }
    } */

    const renderNumberConfig = (key: keyof ElementConfigType) => {
        // NOTE: User terniary operator here instead of ?.
        const resolvedInputValue = transientValue[key]
            ? transientValue[key]!.value
            : config[key];

        const min = key === "inputsCount" ? 2 : 1;
        const max = key === "scale" ? 4 : maxBitsSupported;

        return config[key] !== undefined ? (
            <div className="flex flex-col gap-1">
                <label
                    className="text-gray-700"
                    htmlFor={inputConstants[key]?.id}
                >
                    {inputConstants[key]?.label}
                </label>
                <input
                    id={inputConstants[key]?.id}
                    name={inputConstants[key]?.name}
                    type="number"
                    className={clsx(
                        `rounded px-2.5 py-1 truncate bg-inherit text-md bg-gray-100`,
                        `data-[state=error]:outline data-[state=error]:outline-red-200`
                    )}
                    value={resolvedInputValue}
                    aria-errormessage={
                        transientValue[key]?.error
                            ? transientValue[key]?.error?.at(0)
                            : undefined
                    }
                    data-state={
                        transientValue[key]?.error ? "error" : "noerror"
                    }
                    min={min}
                    max={max}
                    // onBlur={() =>
                    //     handleBlur({
                    //         name: inputConstants[key]?.name!,
                    //     })
                    // }
                    onChange={(e) => {
                        handleChange(
                            {
                                name: inputConstants[key]?.name!,
                                label: inputConstants[key]?.label!,
                                formattedValue: +e.target.value,
                            },
                            e
                        );
                    }}
                ></input>
            </div>
        ) : null;
    };

    const renderRotation = () => {
        return (
            <>
                {config.rotation !== undefined && (
                    <div className="flex flex-col gap-1">
                        <label
                            className="text-gray-700"
                            htmlFor={inputConstants.rotation?.id}
                        >
                            {inputConstants.rotation?.label}
                        </label>
                        <div className="flex gap-3">
                            {[0, 90, 180, 270].map((r, i) => (
                                <button
                                    id={
                                        rotation === r
                                            ? inputConstants.rotation?.id
                                            : undefined
                                    }
                                    key={`element_config_rotation${config.type}_${r}_${i}`}
                                    className={twMerge(
                                        "flex justify-center items-center h-[35px] w-[35px] rounded-md text-xl",
                                        "ring-1 ring-gray-200 ",
                                        rotation === r &&
                                        `ring-2 ring-blue-400`,
                                        "hover:ring-2 hover:ring-blue-400"
                                    )}
                                    style={{
                                        rotate: r + "deg",
                                    }}
                                    onClick={() =>
                                        setConfig((v) => ({
                                            ...v,
                                            rotation: r,
                                        }))
                                    }
                                >
                                    {elementIcon.icon({})}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };
    const renderScale = () => {
        return (
            <>
                {config.scale !== undefined && (
                    <div className="flex flex-col gap-1">
                        <label
                            className="text-gray-700"
                            htmlFor={inputConstants.scale?.id}
                        >
                            {inputConstants.scale?.label}
                        </label>
                        <div
                            id={inputConstants.scale?.id}
                            className="flex gap-3 text-sm"
                        >
                            {["sm", "md", "lg", "xl"].map((s, i) => {
                                const value =
                                    s === "sm"
                                        ? 0.75
                                        : s === "md"
                                            ? 1
                                            : s === "lg"
                                                ? 1.25
                                                : s === "xl"
                                                    ? 1.5
                                                    : undefined;
                                return (
                                    <button
                                        id={
                                            config.scale === value
                                                ? inputConstants.scale?.id
                                                : undefined
                                        }
                                        key={`element_config_scale${config.type}_${s}_${i}`}
                                        className={twMerge(
                                            "flex justify-center items-center rounded-md w-[35px] h-[35px]",
                                            "ring-1 ring-gray-200 ",
                                            "hover:ring-2 hover:ring-blue-400",
                                            config.scale === value &&
                                            `ring-2 ring-blue-400`
                                        )}
                                        onClick={() =>
                                            setConfig((v) => ({
                                                ...v,
                                                scale: value || v.scale,
                                            }))
                                        }
                                    >
                                        {s}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </>
        );
    };
    const renderColor = () => {
        return (
            <>
                {config.color !== undefined && (
                    <div className="flex flex-col">
                        <label
                            className="text-gray-700"
                            htmlFor={inputConstants.color?.id}
                        >
                            {inputConstants.color?.label}
                        </label>
                        <div id={inputConstants.color?.id}>
                            <ColorPicker
                                defaultOptions={ELEMENTS_COLOR_PALETTE}
                                name="elementColor"
                                value={color}
                                onChange={(color) => {
                                    setConfig((v) => ({
                                        ...v,
                                        color: color,
                                    }));
                                }}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    };

    const errorElements = Object.values(transientValue)
        .map((v, i) =>
            v.error?.map((e, j) => (
                <div
                    key={`ERROR_INPUTS_COUNT_${e
                        .split(" ")
                        .join("_")}_${i}_${j}`}
                >
                    {e}
                </div>
            ))
        )
        .reduce((agg, v) => [...(agg || []), ...(v || [])], []);

    if (!top || !config) {
        return null;
    }

    const rotation = config.rotation;
    const color = config.color;

    const elementIcon = elementsIconMap[config.type];

    return (
        <section
            style={{ top: top }}
            className="absolute p-3.5 m-1 bg-white rounded-tr-lg rounded-br-lg border border-gray-300"
        >
            <div className="grid gap-2 p-2" style={{ width: paletteWidth }}>
                <h1 className="text-lg font-bold text-gray-800">
                    {elementsInfo.get(config.type)?.displayName}
                </h1>
                <div className="flex flex-col gap-3">
                    {renderNumberConfig("inputsCount")}
                    {renderNumberConfig("dataBits")}
                    {renderNumberConfig("selectBits")}
                    {renderRotation()}
                    {renderScale()}
                    {renderColor()}
                </div>
                {errorElements && errorElements.length > 0 ? (
                    <div className="grid gap-4 p-2 mt-1 bg-red-100 rounded-md">
                        {errorElements}
                    </div>
                ) : null}
            </div>
        </section>
    );
};

export const ElementConfig = (props: ElementConfigPropType) => {
    const configAtom = useAtomValue(elementConfigAtomAtom);
    const selectedElementConfigAtom = useAtomValue(
        selectedElementConfigAtomAtom
    );
    if (configAtom || selectedElementConfigAtom) {
        return (
            <ElementConfigSection
                configAtom={configAtom || selectedElementConfigAtom!}
                {...props}
            />
        );
    }
    return null;
};
