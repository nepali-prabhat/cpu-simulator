import { paletteWidth } from "@/constants";
import { elementNameMap } from "@/elementsConfig";
import { AndGate } from "@/resources/icons/logic/andGate";
import { activeElementTypeAtom } from "@/state/appState";
import { useAtomValue } from "jotai";

export const ElementConfig = (props: { top: number }) => {
    const activeElement = useAtomValue(activeElementTypeAtom);

    if (!activeElement) {
        return null;
    }

    return (
        <section
            style={{ top: props.top }}
            className="absolute p-3.5 m-1 bg-white rounded-tr-lg rounded-br-lg border border-gray-300"
        >
            <div className="p-2" style={{ width: paletteWidth }}>
                <h1 className="pb-2.5 text-lg font-semibold">
                    {elementNameMap.get(activeElement)}
                </h1>
                TODO: element config options. Inputs, background, stroke, etc
            </div>
        </section>
    );
};
