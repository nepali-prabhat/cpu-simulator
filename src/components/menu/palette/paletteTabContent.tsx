import { Circuits } from "../circuits/circuits";
import { PaletteComponents } from "../components/components";
import { Actions } from "../actions/actions";
import { twMerge } from "tailwind-merge";
import { forwardRef, useLayoutEffect, useRef } from "react";
import { PaletteTab } from "@/types";
import { paletteWidth, scrollWidth, tabs } from "@/constants";
import { useAtom, useAtomValue } from "jotai/react";
import { paletteContentHeightsAtom, paletteContentRefsAtom } from "@/state/ui";

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
            "transition-all duration-100 ease-in",
            props.isActive ? "visible" : "invisible",
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
    const [heightMap, setHeightMap] = useAtom(paletteContentHeightsAtom);
    const paletteContentRefs = useAtomValue(paletteContentRefsAtom);
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const map = new Map();
        tabs.forEach((k) => {
            const height =
                (paletteContentRefs.get(k) &&
                    paletteContentRefs.get(k)?.clientHeight) ||
                0;
            map.set(k, height);
        });
        setHeightMap(map);
    }, [paletteContentRefs, setHeightMap]);

    const activeIndex = tabs.indexOf(props.activeTab);

    let resolvedHeight = heightMap.get(props.activeTab);

    if (props.scrollX !== 0) {
        const startHeight = heightMap.get(props.activeTab) || 0;
        const sign = props.scrollX > 0 ? 1 : -1;
        const nextTab = tabs[tabs.indexOf(props.activeTab) - sign];
        const finalHeight = heightMap.get(nextTab) || 0;
        const currentScroll = sign * Math.min(Math.abs(props.scrollX), width);
        resolvedHeight =
            startHeight +
            sign * (currentScroll / width) * (finalHeight - startHeight);
    }

    let scrollPadding = 0;
    const el = paletteContentRefs.get(props.activeTab);
    if (el && el.clientHeight !== el.scrollHeight) {
        scrollPadding = scrollWidth;
    }

    return (
        <div
            ref={ref}
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
                        paddingRight: scrollPadding,
                        width,
                    }}
                    isActive={activeIndex === i}
                    type={t}
                    ref={(ref) => {
                        paletteContentRefs.set(t, ref);
                        /* refs.current[i] = ref;*/
                    }}
                />
            ))}
        </div>
    );
};
