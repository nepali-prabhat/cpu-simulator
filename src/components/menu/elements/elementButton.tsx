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
        const ref = useRef<HTMLButtonElement>(null);
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
            <div className="flex flex-col gap-1 justify-center items-center">
                <button
                    ref={ref}
                    onClick={handleClick}
                    className={twMerge(
                        "py-3 px-3 text-2xl rounded-md border border-gray-300",
                        "hover:ring-1",
                        props.className,
                        activeElement === props.type &&
                        `ring-2`
                    )}
                >
                    {props.children}
                </button>
                {width && (
                    <span
                        className={`text-sm text-center truncate`}
                        style={{ width: width }}
                        title={props.name}
                    >
                        {props.name}
                    </span>
                )}
            </div>
        );
    },
    () => {
        return true;
    }
);
ElementTypeButton.displayName = "ElementTypeButton";
