import { HTMLAttributes, useLayoutEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export const ComponentButton = (
    props: {
        name: string;
        className?: HTMLAttributes<HTMLButtonElement>["className"];
    } & React.PropsWithChildren
) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [width, setWidth] = useState<number | undefined>();
    useLayoutEffect(() => {
        const rect = ref.current?.getBoundingClientRect();
        setWidth(rect?.width);
    }, [props.name]);
    return (
        <div className="flex flex-col gap-1 justify-center items-center">
            <button
                ref={ref}
                className={twMerge(
                    "py-3 px-3 text-2xl rounded-md border border-gray-300",
                    "hover:ring",
                    props.className
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
};
