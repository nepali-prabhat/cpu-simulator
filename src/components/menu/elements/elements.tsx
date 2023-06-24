import { AndGate } from "@/resources/icons/logic/andGate";
import { Buffer } from "@/resources/icons/logic/buffer";
import { Memory } from "@/resources/icons/logic/memory";
import { Multiply1To2Gate } from "@/resources/icons/logic/multiply1To2";
import { NAndGate } from "@/resources/icons/logic/nandGate";
import { NorGate } from "@/resources/icons/logic/norGate";
import { NotGate } from "@/resources/icons/logic/notGate";
import { OrGate } from "@/resources/icons/logic/orGate";
import { Reduce2To1Gate } from "@/resources/icons/logic/reduce2To1";
import { XnorGate } from "@/resources/icons/logic/xnorGate";
import { XorGate } from "@/resources/icons/logic/xorGate";
import { ElementTypeButton, ComponentButtonProp } from "./elementButton";
import { ElementType } from "@/types";

export const elements: {
    hide?: boolean;
    props: ComponentButtonProp;
    icon: React.FC;
}[] = [
        {
            props: {
                type: "and_gate",
                name: "AND",
                className: "bg-grape-50",
            },
            icon: AndGate,
        },
        {
            props: {
                type: "or_gate",
                name: "OR",
                className: "bg-grape-50",
            },
            icon: OrGate,
        },
        {
            props: {
                type: "not_gate",
                name: "NOT",
                className: "bg-grape-50",
            },
            icon: NotGate,
        },
        {
            props: {
                type: "nand_gate",
                name: "NAND",
                className: "bg-violet-50",
            },
            icon: NAndGate,
        },
        {
            props: {
                type: "nor_gate",
                name: "NOR",
                className: "bg-violet-50",
            },
            icon: NorGate,
        },
        {
            hide: true,
            props: {
                type: "buffer",
                name: "BUFFER",
                className: "bg-violet-50",
            },
            icon: Buffer,
        },
        {
            props: {
                type: "xor_gate",
                name: "XOR",
                className: "bg-indigo-50",
            },
            icon: XorGate,
        },
        {
            props: {
                type: "xnor_gate",
                name: "XNOR",
                className: "bg-indigo-50",
            },
            icon: XnorGate,
        },
        {
            props: {
                type: "mux",
                name: "MUX",
                className: "bg-blue-50",
            },
            icon: Reduce2To1Gate,
        },
        {
            props: {
                type: "dmux",
                name: "DMUX",
                className: "bg-blue-50",
            },
            icon: Multiply1To2Gate,
        },
        {
            props: {
                type: "decoder",
                name: "DECODER",
                className: "bg-blue-50",
            },
            icon: Multiply1To2Gate,
        },
        {
            props: {
                type: "DQ_flip_flop",
                name: "DQ Flip flop",
                className: "bg-cyan-50",
            },
            icon: Memory,
        },
        {
            props: {
                type: "JK_flip_flop",
                name: "JK Flip flop",
                className: "bg-cyan-50",
            },
            icon: Memory,
        },
    ];
export const elementsIconMap = Object.fromEntries(
    elements.map((e) => [e.props.type, e])
);

export const PaletteElements = () => {
    return (
        <div className="grid grid-cols-4 gap-x-2 gap-y-2 content-start max-h-[225px] px-[4px] py-[4px]">
            {elements.map(
                (v, i) =>
                    !v.hide && (
                        <ElementTypeButton
                            key={`palette_icon_${v.props.type}_${i}`}
                            {...v.props}
                        >
                            <v.icon />
                        </ElementTypeButton>
                    )
            )}
        </div>
    );
};
