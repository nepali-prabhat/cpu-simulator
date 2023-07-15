import { ActionsMenuIcon } from "@/resources/icons/ui/actionsMenuIcon";
import { CircuitIcon } from "@/resources/icons/ui/circuit";
import { ComponentIcon } from "@/resources/icons/ui/componentIcon";
import { activePaletteTabAtom } from "@/state/ui";
import { tabs } from "@/constants/constants";
import { PaletteTab } from "@/types";
import clsx from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { memo } from "react";
import { twMerge } from "tailwind-merge";

const PaletteTabItem = (props: { type: PaletteTab }) => {
    const activeTab = useAtomValue(activePaletteTabAtom);
    const className = twMerge(
        "scale-95",
        activeTab === props.type
            ? `scale-150 opactiy-50`
            : "group-hover:opacity-100 group-hover:scale-125"
    );
    switch (props.type) {
        case "actions":
            return <ActionsMenuIcon className={className} />;
        case "elements":
            return <ComponentIcon className={className} />;
        case "circuit": {
            return <CircuitIcon className={className} />;
        }
    }
};

export const PaletteTabs = memo(
    () => {
        const setActiveTab = useSetAtom(activePaletteTabAtom);
        return (
            <>
                {tabs.map((key) => (
                    <button
                        key={`PALETTE_TAB_${key}`}
                        className={clsx("p-2.5 rounded group")}
                        onClick={() => {
                            setActiveTab(key);
                        }}
                        title={key}
                    >
                        <PaletteTabItem type={key} />
                    </button>
                ))}
            </>
        );
    },
    () => true
);
PaletteTabs.displayName = "PaletteTabs";
