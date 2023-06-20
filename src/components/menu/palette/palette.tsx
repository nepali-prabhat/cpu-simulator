import { PaletteTabs } from "./paletteTabs";
import { PaletteTabContent } from "./paletteTabContent";
import { useAtom } from "jotai";
import { activePaletteTabAtom } from "@/state/ui";
import { useState } from "react";

export const Palette = () => {
    const [activeTab] = useAtom(activePaletteTabAtom);
    const [scrollX] = useState(0);

    return (
        <section className={"flex gap-2 flex-col"}>
            <div className="self-center">
                <PaletteTabs />
            </div>
            <PaletteTabContent scrollX={scrollX} activeTab={activeTab} />
        </section>
    );
};
