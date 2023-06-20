import { PaletteTabs } from "./paletteTabs";
import { PaletteSearch } from "./paletteSearch";
import { PaletteTabContent } from "./paletteTabContent";
import { useAtom, useSetAtom } from "jotai";
import { activePaletteTabAtom, partialActivePaletteTabAtom } from "@/state/ui";
import { useSwipeable } from "react-swipeable";
import { paletteWidth, tabs } from "@/constants";
import { useState } from "react";

export const Palette = () => {
    const [activeTab, setActiveTab] = useAtom(activePaletteTabAtom);
    const setPartialActiveTab = useSetAtom(partialActivePaletteTabAtom);
    const [scrollX, setScrollX] = useState(0);
    const activeIndex = tabs.indexOf(activeTab);

    const handlers = useSwipeable({
        onSwiping: (e) => {
            let resolvedDeltaX: number;
            if (activeIndex === 0) {
                resolvedDeltaX = e.deltaX;
                if (resolvedDeltaX > 30) {
                    resolvedDeltaX = 30;
                }
                if (resolvedDeltaX < -paletteWidth) {
                    resolvedDeltaX = -paletteWidth;
                }
            } else if (activeIndex === tabs.length - 1) {
                resolvedDeltaX = e.deltaX;
                if (resolvedDeltaX < -30) {
                    resolvedDeltaX = -30;
                }
                if (resolvedDeltaX > paletteWidth) {
                    resolvedDeltaX = paletteWidth;
                }
            } else {
                resolvedDeltaX = e.deltaX;
                if (resolvedDeltaX > paletteWidth) {
                    resolvedDeltaX = paletteWidth;
                }
                if (resolvedDeltaX < -paletteWidth) {
                    resolvedDeltaX = -paletteWidth;
                }
            }
            setScrollX(resolvedDeltaX);
            const sign = resolvedDeltaX > 0 ? 1 : -1;
            setPartialActiveTab((v) => tabs[activeIndex - sign] || v);
        },
        onSwiped: () => {
            setScrollX(0);
        },
        onSwipedLeft: () => {
            setActiveTab((v) => {
                const activeTabIndex = tabs.indexOf(v);
                return tabs[activeTabIndex + 1] || v;
            });
        },
        onSwipedRight: () => {
            setActiveTab((v) => {
                const activeTabIndex = tabs.indexOf(v);
                return tabs[activeTabIndex - 1] || v;
            });
        },
        trackMouse: true,
        trackTouch: true,
        preventScrollOnSwipe: true,
    });

    return (
        <section {...handlers} className={"flex gap-2 flex-col"}>
            <PaletteSearch />
            <PaletteTabContent scrollX={scrollX} activeTab={activeTab} />
            <div className="self-center">
                <PaletteTabs />
            </div>
        </section>
    );
};