import { mergeRefs } from "@/utils";
import clsx from "clsx";
import { forwardRef, useLayoutEffect, useRef } from "react";

const inputpl = 2.5;
type PropType = {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    onSubmit?: () => void;
    isDragging?: boolean;
    maxWidth?: number | string;
    disableAutoResize?: boolean;
};
export const CircuitTitleInput = forwardRef<HTMLInputElement, PropType>(
    (
        {
            value,
            onChange,
            placeholder = "Untitled",
            onSubmit,
            isDragging,
            maxWidth = 200,
            disableAutoResize,
        }: PropType,
        ref
    ) => {
        const titleRef = useRef<HTMLInputElement>(null);
        const spanRef = useRef<HTMLInputElement>(null);

        useLayoutEffect(() => {
            if (!disableAutoResize) {
                const spanWidth =
                    spanRef.current?.getBoundingClientRect().width || 0;
                const width = spanWidth + inputpl * 4 * 2;
                const resolvedWidth = width;
                titleRef.current?.setAttribute(
                    "style",
                    `width:${resolvedWidth}px; max-width:${maxWidth}px`
                );
            }
        }, [disableAutoResize, value, maxWidth]);

        const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
        };
        const handleKeyUp = (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
                onSubmit && onSubmit();
            }
        };

        const sv = (value || placeholder).split(" ");
        const spanValue = sv.map((v, i) => {
            const key = `CIRCUIT_TITLE_${i}_${v}_`;
            return sv.length - 1 !== i ? (
                <span key={key}>{v}&nbsp;</span>
            ) : (
                <span key={key}>{v}</span>
            );
        });

        return (
            <>
                <input
                    ref={mergeRefs([titleRef, ref])}
                    className={clsx(
                        `rounded px-2.5 truncate bg-inherit text-sm focus:bg-neutral-100`,
                        !isDragging && "hover:bg-neutral-100",
                        isDragging && "cursor-grabbing"
                    )}
                    placeholder={placeholder}
                    style={{ maxWidth }}
                    value={value}
                    onChange={handleTitleChange}
                    onKeyUp={handleKeyUp}
                    aria-label={"Name of the circuit"}
                    title={value}
                    disabled={isDragging}
                />
                {!disableAutoResize && (
                    <span
                        className={`absolute bg-gray-300 text-sm left-0 top-[-1000px]`}
                        ref={spanRef}
                    >
                        {spanValue}
                    </span>
                )}
            </>
        );
    }
);
CircuitTitleInput.displayName = "CircuitTitleInput";
