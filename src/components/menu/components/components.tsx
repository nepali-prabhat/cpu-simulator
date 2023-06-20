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
import { ComponentButton } from "./componentButton";

export const PaletteComponents = () => {
    return (
        <div
            className="grid grid-cols-4 gap-2 pr-[4px] pt-[4px] h-[400px]"
        >
            <ComponentButton name="AND">
                <AndGate />
            </ComponentButton>
            <ComponentButton name="OR">
                <OrGate />
            </ComponentButton>
            <ComponentButton name="NOT">
                <NotGate />
            </ComponentButton>
            <ComponentButton name="NAND">
                <NAndGate />
            </ComponentButton>
            <ComponentButton name="NOR">
                <NorGate />
            </ComponentButton>
            <ComponentButton name="BUFFER">
                <Buffer />
            </ComponentButton>
            <ComponentButton name="XOR">
                <XorGate />
            </ComponentButton>
            <ComponentButton name="XNOR">
                <XnorGate />
            </ComponentButton>
            <ComponentButton name="MUX">
                <Reduce2To1Gate />
            </ComponentButton>
            <ComponentButton name="DMUX">
                <Multiply1To2Gate />
            </ComponentButton>
            <ComponentButton name="DECODER">
                <Multiply1To2Gate />
            </ComponentButton>
            <ComponentButton name="DQ Flip flop">
                <Memory />
            </ComponentButton>
            <ComponentButton name="AND">
                <AndGate />
            </ComponentButton>
            <ComponentButton name="OR">
                <OrGate />
            </ComponentButton>
            <ComponentButton name="NOT">
                <NotGate />
            </ComponentButton>
            <ComponentButton name="NAND">
                <NAndGate />
            </ComponentButton>
            <ComponentButton name="NOR">
                <NorGate />
            </ComponentButton>
            <ComponentButton name="BUFFER">
                <Buffer />
            </ComponentButton>
            <ComponentButton name="XOR">
                <XorGate />
            </ComponentButton>
            <ComponentButton name="XNOR">
                <XnorGate />
            </ComponentButton>
            <ComponentButton name="MUX">
                <Reduce2To1Gate />
            </ComponentButton>
            <ComponentButton name="DMUX">
                <Multiply1To2Gate />
            </ComponentButton>
            <ComponentButton name="DECODER">
                <Multiply1To2Gate />
            </ComponentButton>
            <ComponentButton name="DQ Flip flop">
                <Memory />
            </ComponentButton>
        </div>
    );
};
