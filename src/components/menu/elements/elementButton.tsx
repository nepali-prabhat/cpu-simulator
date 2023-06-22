import { HTMLAttributes, memo, useLayoutEffect, useRef, useState } from "react";
import { ElementType } from "@/types";
import { twMerge } from "tailwind-merge";
import { useAtom } from "jotai";
import { activeElementTypeAtom } from "@/state/appState";

export type ComponentButtonProp = {
    type: ElementType;
    name: string;
    className?: HTMLAttributes<HTMLButtonElement>["className"];
};
export const ElementTypeButton = memo(
    (props: ComponentButtonProp & React.PropsWithChildren) => {
        const [activeElement, setActiveElement] = useAtom(
            activeElementTypeAtom
        );
        const ref = useRef<HTMLDivElement>(null);
        const [width, setWidth] = useState<number | undefined>();
        useLayoutEffect(() => {
            const rect = ref.current?.getBoundingClientRect();
            setWidth(rect?.width);
        }, [props.name]);

        // TODO: handleonClick
        const handleClick = () => {
            setActiveElement(props.type);
        };

        return (
            <button
                className={twMerge(
                    "px-1 flex flex-col rounded-md justify-center items-center"
                )}
            >
                <div
                    ref={ref}
                    onClick={handleClick}
                    className={twMerge(
                        "py-3 px-3 text-2xl rounded-md ring-1 ring-gray-200",
                        "hover:ring-2 hover:ring-blue-200",
                        props.className,
                        activeElement === props.type && `ring-2 ring-blue-400`
                    )}
                >
                    {props.children}
                </div>
                {width && (
                    <span
                        onClick={handleClick}
                        className={twMerge(
                            `text-sm mt-1 rounded-md select-none text-center truncate p-0.5`
                        )}
                        style={{ width: width }}
                        title={props.name}
                    >
                        {props.name}
                    </span>
                )}
            </button>
        );
    },
    () => {
        return true;
    }
);
ElementTypeButton.displayName = "ElementTypeButton";
