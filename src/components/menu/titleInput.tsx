import { useLayoutEffect, useRef } from "react";

const inputpl = 2.5;
const placeholder = "circuit name";
export const TitleInput = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) => {
    const titleRef = useRef<HTMLInputElement>(null);
    const spanRef = useRef<HTMLInputElement>(null);

    // Better to implement this with useLayoutEffect
    useLayoutEffect(() => {
        const spanWidth = spanRef.current?.getBoundingClientRect().width || 0;
        const width = spanWidth + inputpl * 4 * 2;
        const resolvedWidth = width;
        titleRef.current?.setAttribute("style", `width:${resolvedWidth}px`);
    }, [value]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
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
                ref={titleRef}
                className={`rounded px-2.5 max-w-[200px] truncate bg-inherit text-sm focus:bg-neutral-100 hover:bg-neutral-100`}
                placeholder={placeholder}
                value={value}
                onChange={handleTitleChange}
                aria-label={"Name of the circuit"}
                title={value}
            />
            <span
                className={`absolute bg-gray-300 text-sm left-0 top-[-1000px]`}
                ref={spanRef}
            >
                {spanValue}
            </span>
        </>
    );
};
