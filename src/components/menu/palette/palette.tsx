import { PaletteTabs } from "./paletteTabs";
import { PaletteTabContent } from "./paletteTabContent";
import { useAtom, useAtomValue } from "jotai";
import { activePaletteTabAtom } from "@/state/ui";
import { paletteTitleMap, paletteWidth } from "@/constants/constants";

const PaletteTitle = () => {
    const activeTab = useAtomValue(activePaletteTabAtom);
    return (
        <h1 className="text-xl font-bold text-center">
            {paletteTitleMap.get(activeTab)}
        </h1>
    );
};

export const Palette = () => {
    const [activeTab] = useAtom(activePaletteTabAtom);

    return (
        <section
            className={"flex gap-2 flex-col"}
            style={{ width: paletteWidth }}
        >
            <div className="self-center">
                <PaletteTabs />
            </div>
            {/* <PaletteTitle /> */}
            <PaletteTabContent activeTab={activeTab} />
        </section>
    );
};
