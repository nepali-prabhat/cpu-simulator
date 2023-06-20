import { ActionsMenuIcon } from "@/resources/icons/ui/actionsMenuIcon";
import { CircuitIcon } from "@/resources/icons/ui/circuit";
import { ComponentIcon } from "@/resources/icons/ui/componentIcon";
import { activePaletteTabAtom, partialActivePaletteTabAtom } from "@/state/ui";
import { PaletteTab } from "@/types";
import clsx from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { memo } from "react";

const icons: { key: PaletteTab; component: JSX.ElementType }[] = [
    { key: "actions", component: ActionsMenuIcon },
    { key: "component", component: ComponentIcon },
    { key: "circuit", component: CircuitIcon },
];

export const PaletteTabs = memo(
    () => {
        const [activeTab, setActiveTab] = useAtom(activePaletteTabAtom);
        const partialActiveTab = useAtomValue(partialActivePaletteTabAtom);
        return (
            <>
                {icons.map((i) => (
                    <button
                        key={`PALETTE_TAB_${i.key}`}
                        className={clsx("p-2.5 rounded group")}
                        onClick={() => {
                            setActiveTab(i.key);
                        }}
                        title={i.key}
                    >
                        <i.component
                            className={clsx(
                                "group-hover:opacity-100 transition-all duration-100 ease-linear",
                                activeTab === i.key
                                    ? "scale-150 opactiy-100"
                                    : partialActiveTab === i.key
                                        ? "opacity-100 scale-125"
                                        : "opacity-50 group-hover:scale-125"
                            )}
                        />
                    </button>
                ))}
            </>
        );
    },
    () => true
);
PaletteTabs.displayName = "PaletteTabs";
