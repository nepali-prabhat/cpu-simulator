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
    isActive: boolean;
    className?: React.HTMLAttributes<HTMLDivElement>["className"];
    style?: React.HTMLAttributes<HTMLDivElement>["style"];
};
const PaletteTabItem = forwardRef<HTMLDivElement, TabPropType>(
    (props: TabPropType, ref) => {
        const className = twMerge(
            "absolute top-0 z-10",
            "transition-all duration-100 ease-out",
            props.className
        );
        const style = props.style;
        switch (props.type) {
            case "actions":
                return (
                    <div ref={ref} className={`${className}`} style={style}>
                        <Actions />
                    </div>
                );
            case "component":
                return (
                    <div ref={ref} className={className} style={style}>
                        <PaletteComponents />
                    </div>
                );
            case "circuit":
                return (
                    <div ref={ref} className={className} style={style}>
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

    let resolvedHeight = heights[activeIndex];

    if (props.scrollX !== 0) {
        const startHeight = heights[activeIndex] || 0;
        const sign = props.scrollX > 0 ? 1 : -1;
        const finalHeight = heights[activeIndex - sign] || 0;
        const currentScroll = sign * Math.min(Math.abs(props.scrollX), width);
        resolvedHeight =
            startHeight +
            sign * (currentScroll / width) * (finalHeight - startHeight);
    }

    return (
        <div
            className={twMerge(
                "relative transition-all duration-100 ease-in-out",
                true && "overflow-x-hidden",
                props.activeTab !== "component" && "overflow-y-hidden"
            )}
            style={{
                width: width,
                height: resolvedHeight,
            }}
        >
            {tabs.map((t, i) => (
                <PaletteTabItem
                    key={`PALETTE_TAB_ITEM${t.toUpperCase()}`}
                    style={{
                        left: (i - activeIndex) * width + props.scrollX,
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
