import { Circuits } from "../circuits/circuits";
import { PaletteElements } from "../elements/elements";
import { Actions } from "../actions/actions";
import { twMerge } from "tailwind-merge";
import { forwardRef, useRef } from "react";
import { PaletteTab } from "@/types";
import { paletteWidth } from "@/constants";
import clsx from "clsx";

const width = paletteWidth;
type TabPropType = {
    type: PaletteTab;
    className?: React.HTMLAttributes<HTMLDivElement>["className"];
    style?: React.HTMLAttributes<HTMLDivElement>["style"];
};
const PaletteTabItem = forwardRef<HTMLDivElement, TabPropType>(
    (props: TabPropType, ref) => {
        const className = twMerge("duration-100 ease-in", props.className);
        const style = props.style;
        switch (props.type) {
            case "actions":
                return (
                    <div ref={ref} className={`${className}`} style={style}>
                        <Actions />
                    </div>
                );
            case "elements":
                return (
                    <div ref={ref} className={className} style={style}>
                        <PaletteElements />
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
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={ref}
            className={clsx("overflow-x-hidden")}
            style={{
                width: width,
            }}
        >
            <PaletteTabItem
                key={`PALETTE_TAB_ITEM${props.activeTab.toUpperCase()}`}
                type={props.activeTab}
            />
        </div>
    );
};
