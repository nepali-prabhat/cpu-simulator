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
            "duration-100 ease-in",
            props.isActive ? "visible" : "invisible",
            props.className
        );
        const style = {
            ...props.style,
            transitionProperty: "left",
        };
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

export const PaletteTabContent = (props: { activeTab: PaletteTab }) => {
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
    const isComponentActive = props.activeTab === "component";

    return (
        <div
            ref={ref}
            className={twMerge(
                "relative duration-100 ease-in-out",
                "overflow-x-hidden",
                !isComponentActive ? "overflow-y-hidden" : "overflow-y-scroll"
            )}
            style={{
                transitionProperty: "height, width",
                width: width,
                height: resolvedHeight,
            }}
        >
            {tabs.map((t, i) => {
                return (
                    <PaletteTabItem
                        key={`PALETTE_TAB_ITEM${t.toUpperCase()}`}
                        style={{
                            left: (i - activeIndex) * width,
                            width: width,
                            paddingRight: t === "component" ? scrollWidth : 0,
                        }}
                        isActive={activeIndex === i}
                        type={t}
                        ref={(ref) => {
                            paletteContentRefs.set(t, ref);
                        }}
                    />
                );
            })}
        </div>
    );
};
