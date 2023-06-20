import { ActionsMenuIcon } from "@/resources/icons/ui/actionsMenuIcon";
import { CircuitIcon } from "@/resources/icons/ui/circuit";
import { ComponentIcon } from "@/resources/icons/ui/componentIcon";
import { activePaletteTabAtom } from "@/state/ui";
import { PaletteTab } from "@/types";
import clsx from "clsx";
import { useAtom } from "jotai";

const icons: { key: PaletteTab; component: JSX.ElementType }[] = [
    { key: "actions", component: ActionsMenuIcon },
    { key: "component", component: ComponentIcon },
    { key: "circuit", component: CircuitIcon },
];

export const PaletteTabs = () => {
    const [activeTab, setActiveTab] = useAtom(activePaletteTabAtom);
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
                            "group-hover:opacity-100",
                            activeTab === i.key
                                ? "scale-150 opactiy-100"
                                : " opacity-50 group-hover:scale-125"
                        )}
                    />
                </button>
            ))}
        </>
    );
};
