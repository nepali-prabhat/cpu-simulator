import { HTMLAttributes, memo } from "react";
import { ElementType } from "@/types";
import { twMerge } from "tailwind-merge";
import { useAtom } from "jotai";
import { activeElementTypeAtom } from "@/state/appState";

export type ComponentButtonProp = {
    type: ElementType;
    name: string;
    className?: HTMLAttributes<HTMLButtonElement>["className"];
};
const width = 42;
export const ElementTypeButton = memo(
    (props: ComponentButtonProp & React.PropsWithChildren) => {
        const [activeElement, setActiveElement] = useAtom(
            activeElementTypeAtom
        );

        // TODO: handleonClick
        const handleClick = () => {
            setActiveElement(props.type);
        };

        return (
            <div
                className={twMerge(
                    "group px-1 flex flex-col rounded-md justify-center items-center"
                )}
            >
                <button
                    onClick={handleClick}
                    className={twMerge(
                        "py-3 px-3 text-2xl rounded-md ring-1 ring-gray-200",
                        props.className,
                        activeElement === props.type
                            ? `ring-2 ring-blue-400`
                            : "group-hover:ring-2 group-hover:ring-blue-200"
                    )}
                >
                    {props.children}
                </button>
                <button
                    onClick={handleClick}
                    className={twMerge(
                        `text-sm pt-2 rounded-md select-none text-center truncate px-0.5`
                    )}
                    style={{ width: width }}
                    title={props.name}
                >
                    {props.name}
                </button>
            </div>
        );
    },
    () => {
        return true;
    }
);
ElementTypeButton.displayName = "ElementTypeButton";
