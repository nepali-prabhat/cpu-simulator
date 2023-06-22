import { Circuits } from "../circuits/circuits";
import { PaletteElements } from "../elements/elements";
import { Actions } from "../actions/actions";
import { forwardRef, useRef } from "react";
import { PaletteTab } from "@/types";
import { paletteWidth } from "@/constants";
import clsx from "clsx";

const width = paletteWidth;
type TabPropType = {
    type: PaletteTab;
};
const PaletteTabItem = forwardRef<HTMLDivElement, TabPropType>(
    (props: TabPropType, ref) => {
        switch (props.type) {
            case "actions":
                return (
                    <div ref={ref}>
                        <Actions />
                    </div>
                );
            case "elements":
                return (
                    <div ref={ref}>
                        <PaletteElements />
                    </div>
                );
            case "circuit":
                return (
                    <div ref={ref}>
                        <Circuits />
                    </div>
                );
        }
    }
);
PaletteTabItem.displayName = "PaletteTabItem";

export const PaletteTabContent = (props: { activeTab: PaletteTab }) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div ref={ref} className={clsx("overflow-x-hidden")}>
            <PaletteTabItem
                key={`PALETTE_TAB_ITEM${props.activeTab.toUpperCase()}`}
                type={props.activeTab}
            />
        </div>
    );
};
