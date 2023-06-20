import { ActionsMenuIcon } from "@/resources/icons/ui/actionsMenuIcon";
import { CircuitIcon } from "@/resources/icons/ui/circuit";
import { ComponentIcon } from "@/resources/icons/ui/componentIcon";
import { activePaletteTabAtom, partialActivePaletteTabAtom } from "@/state/ui";
import { tabs } from "@/constants";
import { PaletteTab } from "@/types";
import clsx from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { memo } from "react";
import { twMerge } from "tailwind-merge";

const PaletteTabItem = (props: { type: PaletteTab }) => {
    const activeTab = useAtomValue(activePaletteTabAtom);
    const partialActiveTab = useAtomValue(partialActivePaletteTabAtom);
    switch (props.type) {
        case "actions":
            return (
                <ActionsMenuIcon
                    className={twMerge(
                        "transition-all duration-100 ease-linear scale-75",
                        activeTab === props.type
                            ? "scale-150 opactiy-50"
                            : partialActiveTab === props.type
                                ? "opacity-100 scale-125"
                                : "group-hover:opacity-100 group-hover:scale-125"
                    )}
                />
            );
        case "component":
            return (
                <ComponentIcon
                    className={twMerge(
                        "transition-all duration-100 ease-linear scale-75",
                        activeTab === props.type
                            ? "scale-150 opactiy-50"
                            : partialActiveTab === props.type
                                ? "opacity-100 scale-125"
                                : "group-hover:opacity-100 group-hover:scale-125"
                    )}
                />
            );
        case "circuit": {
            return (
                <CircuitIcon
                    className={twMerge(
                        "transition-all duration-100 ease-linear scale-75",
                        activeTab === props.type
                            ? "scale-150 opactiy-50"
                            : partialActiveTab === props.type
                                ? "opacity-100 scale-125"
                                : "group-hover:opacity-100 group-hover:scale-125"
                    )}
                />
            );
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
