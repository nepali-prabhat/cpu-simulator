import { Circuits } from "../circuits/circuits";
import { PaletteComponents } from "../components/components";
import { Actions } from "../actions/actions";
import { twMerge } from "tailwind-merge";
import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { PaletteTab } from "@/types";
import { paletteWidth, tabs } from "@/constants";

const width = paletteWidth;

type TabPropType = {
    type: PaletteTab;
    className?: React.HTMLAttributes<HTMLDivElement>["className"];
    style?: React.HTMLAttributes<HTMLDivElement>["style"];
    isActive?: boolean;
};
const PaletteTabItem = forwardRef<HTMLDivElement, TabPropType>(
    (props: TabPropType, ref) => {
        const className = twMerge(
            "absolute top-0 z-10",
            "transition-all duration-100 ease-out",
            // props.isActive ? "visible" : "invisible",
            props.className
        );
        switch (props.type) {
            case "actions":
                return (
                    <div
                        ref={ref}
                        className={`${className} `}
                        style={props.style}
                    >
                        <Actions />
                    </div>
                );
            case "component":
                return (
                    <div ref={ref} className={className} style={props.style}>
                        <PaletteComponents />
                    </div>
                );
            case "circuit":
                return (
                    <div ref={ref} className={className} style={props.style}>
                        <Circuits />
                    </div>
                );
        }
    }
);
PaletteTabItem.displayName = "PaletteTabItem";

export const PaletteTabContent = (props: {
    scrollX: number;
    activeTab: PaletteTab;
}) => {
    const [heights, setHeights] = useState<(number | undefined)[]>([]);
    const refs = useRef<(HTMLDivElement | null)[]>([]);

    useLayoutEffect(() => {
        const heights = refs.current?.map((v) => v?.clientHeight);
        setHeights(heights);
    }, []);
    const activeIndex = tabs.indexOf(props.activeTab);

    return (
        <div
            className={twMerge(
                "relative transition-all duration-100 ease-in-out",
                true && "overflow-x-hidden"
            )}
            style={{
                width: width,
                height: heights[activeIndex]
            }}
        >
            {tabs.map((t, i) => (
                <PaletteTabItem
                    key={`PALETTE_TAB_ITEM${t.toUpperCase()}`}
                    style={{
                        left: (i - activeIndex) * width,
                        width: width,
                        paddingRight: 8,
                    }}
                    isActive={activeIndex === i}
                    type={t}
                    ref={(ref) => {
                        refs.current[i] = ref;
                    }}
                />
            ))}
        </div>
    );
};
