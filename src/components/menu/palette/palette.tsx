import { PaletteTabs } from "./paletteTabs";
import { PaletteSearch } from "./paletteSearch";
import { PaletteTabContent } from "./paletteTabContent";
import { useAtom } from "jotai";
import { activePaletteTabAtom } from "@/state/ui";
import { useCallback, useEffect, useRef } from "react";
import { tabs } from "@/constants";

export const Palette = () => {
    const [activeTab, setActiveTab] = useAtom(activePaletteTabAtom);
    const ref = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<
        | {
            lastScrollX: number;
            lastTimeoutId?: NodeJS.Timeout;
        }
        | undefined
    >(undefined);
    const lockedRef = useRef<{
        locked: boolean;
        timeoutId?: NodeJS.Timeout;
    }>({ locked: false });

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            clearTimeout(scrollRef.current?.lastTimeoutId);
            const current = scrollRef.current;
            const timeoutId = setTimeout(() => {
                // TODO: check the direction and change activeTab
                console.log("scrollref timeout: ", scrollRef.current);
                if (!lockedRef.current.locked) {
                    const scrollX = scrollRef.current?.lastScrollX || 0;
                    if (Math.abs(scrollX) > 0) {
                        const direction = scrollX > 0 ? "left" : "right";
                        setActiveTab((v) => {
                            const currentIndex = tabs.indexOf(v);
                            let nextIndex =
                                direction === "left"
                                    ? currentIndex - 1
                                    : currentIndex + 1;

                            /* nextIndex = Math.min(
                            tabs.length - 1,
                            Math.max(nextIndex, 0)
                        ); */
                            return tabs[nextIndex] || v;
                        });
                    }
                    lockedRef.current.locked = true;
                    lockedRef.current.timeoutId = setTimeout(() => {
                        lockedRef.current.locked = false;
                    }, 500);
                    scrollRef.current = undefined;
                }
            }, 10);
            let resolvedDeltaX = 0;
            if (e.shiftKey) {
                resolvedDeltaX = e.deltaY;
                e.preventDefault();
            }
            if (!e.deltaY) {
                resolvedDeltaX = e.deltaX;
            }
            const rate = 0.01;
            const scrollX = (current?.lastScrollX || 0) + rate * resolvedDeltaX;
            scrollRef.current = {
                lastScrollX: scrollX,
                lastTimeoutId: timeoutId,
            };
            /* console.log(
                "scrollref: ",
                scrollRef.current,
                e.deltaX,
                scrollX,
                resolvedDeltaX
            ); */
        },
        [setActiveTab]
    );
    useEffect(() => {
        const _handleWheel = (e: WheelEvent) => {
            handleWheel(e);
        };
        let element = ref.current;
        element?.addEventListener("wheel", _handleWheel, { passive: false });
        return () => {
            element?.removeEventListener("wheel", _handleWheel);
        };
    }, [handleWheel]);

    useEffect(() => {
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            clearTimeout(scrollRef.current?.lastTimeoutId);
        };
    }, []);

    return (
        <section ref={ref} className={"flex gap-2 flex-col"}>
            <div className="self-center">
                <PaletteTabs />
            </div>
            <PaletteSearch />
            <PaletteTabContent scrollX={scrollX} activeTab={activeTab} />
        </section>
    );
};
