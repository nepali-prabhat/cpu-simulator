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
import {
    HTMLAttributes,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { twMerge } from "tailwind-merge";

const ElementButton = (
    props: {
        name: string;
        className?: HTMLAttributes<HTMLButtonElement>["className"];
    } & React.PropsWithChildren
) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [width, setWidth] = useState<number | undefined>();
    useLayoutEffect(() => {
        const rect = ref.current?.getBoundingClientRect();
        setWidth(rect?.width);
    }, [props.name]);
    return (
        <div className="flex flex-col gap-1 justify-center items-center">
            <button
                ref={ref}
                className={twMerge(
                    "py-3 px-3 text-2xl rounded-md border border-gray-300",
                    "hover:ring",
                    props.className
                )}
            >
                {props.children}
            </button>
            {width && (
                <span
                    className={`text-sm text-center truncate`}
                    style={{ width: width }}
                    title={props.name}
                >
                    {props.name}
                </span>
            )}
        </div>
    );
};

export const Palette = () => {
    const paletteRef = useRef<HTMLDivElement>(null);
    const activeContentRef = useRef<HTMLDivElement>(null);
    const scroll = useRef<number>(0);
    useEffect(() => {
        let palette = paletteRef.current;
        let _handleWheel = (e: WheelEvent) => {
            handleWheel(e);
        };
        palette?.addEventListener("wheel", _handleWheel, {
            passive: false,
        });
        palette?.addEventListener("wheel", _handleWheel, {
            passive: false,
        });
        return () => {
            palette?.removeEventListener("wheel", _handleWheel);
        };
    }, []);

    const handleWheel = (e: WheelEvent) => {
        // need to throttle this
        e.preventDefault();
        e.stopPropagation();
        console.log("handle wheel: ", e);
        // TODO: change the horizontal position of
    };

    return (
        <section
            ref={paletteRef}
            className="bg-white flex flex-col absolute left-0 justify-center items-center py-3 px-4 mx-1 mt-2 bg-#fff rounded-lg  border border-gray-300 top-[45px]"
        >
            <div className="flex gap-1 justify-center items-center">
                <button className="p-1 rounded hover:bg-gray-200">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1.5em"
                        height="1.5em"
                        fill="none"
                        viewBox="0 0 64 64"
                    >
                        <path
                            fill="currentColor"
                            d="M24.125 25.75H33.5a3.134 3.134 0 0 0 3.125-3.125V13.25a3.134 3.134 0 0 0-3.125-3.125h-9.375A3.134 3.134 0 0 0 21 13.25v9.375a3.134 3.134 0 0 0 3.125 3.125Zm1.563-10.938h6.25v6.25h-6.25v-6.25ZM39.75 32H24.125A3.125 3.125 0 0 0 21 35.125V50.75a3.125 3.125 0 0 0 3.125 3.125H39.75c1.726 0 3.125-1.4 3.125-3.125V35.125A3.125 3.125 0 0 0 39.75 32Zm-1.563 17.188h-12.5v-12.5h12.5v12.5Z"
                        />
                    </svg>
                </button>
                <button className="p-1 rounded hover:bg-gray-200">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1.5em"
                        height="1.5em"
                        fill="none"
                        viewBox="0 0 64 64"
                    >
                        <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M18 14.341a5.997 5.997 0 0 0-2.526 1.72A5.995 5.995 0 0 0 14 20v.75h-3.75a2.25 2.25 0 0 0 0 4.5H14v13.5h-3.75a2.25 2.25 0 0 0 0 4.5H14V44c0 1.093.292 2.117.803 3A5.99 5.99 0 0 0 20 50h.75v3.75a2.25 2.25 0 0 0 4.5 0V50h13.5v3.75a2.25 2.25 0 0 0 4.5 0V50H44a5.978 5.978 0 0 0 4-1.528A6.03 6.03 0 0 0 49.197 47c.51-.883.803-1.907.803-3v-.75h3.75a2.25 2.25 0 0 0 0-4.5H50v-13.5h3.75a2.25 2.25 0 0 0 0-4.5H50V20a5.99 5.99 0 0 0-3-5.197A5.972 5.972 0 0 0 44 14h-.75v-3.75a2.25 2.25 0 0 0-4.5 0V14h-13.5v-3.75a2.25 2.25 0 0 0-4.5 0V14H20a5.99 5.99 0 0 0-2 .341ZM23 26a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H26a3 3 0 0 1-3-3V26Zm21 19.5c.827 0 1.5-.673 1.5-1.5V20c0-.827-.673-1.5-1.5-1.5H20c-.827 0-1.5.673-1.5 1.5v24c0 .827.673 1.5 1.5 1.5h24Zm-16.5-9h9v-9h-9v9Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>
            <div className="flex gap-2 justify-center items-center m-2 text-lg font-semibold">
                <h1>Components</h1>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <ElementButton name="AND">
                    <AndGate />
                </ElementButton>
                <ElementButton name="NAND">
                    <NAndGate />
                </ElementButton>
                <ElementButton name="OR">
                    <OrGate />
                </ElementButton>
                <ElementButton name="NOR">
                    <NorGate />
                </ElementButton>
                <ElementButton name="BUFFER">
                    <Buffer />
                </ElementButton>
                <ElementButton name="NOT">
                    <NotGate />
                </ElementButton>
                <ElementButton name="XOR">
                    <XorGate />
                </ElementButton>
                <ElementButton name="XNOR">
                    <XnorGate />
                </ElementButton>
                <ElementButton name="MUX">
                    <Reduce2To1Gate />
                </ElementButton>
                <ElementButton name="DMUX">
                    <Multiply1To2Gate />
                </ElementButton>
                <ElementButton name="DECODER">
                    <Multiply1To2Gate />
                </ElementButton>
                <ElementButton name="DQ Flip flop">
                    <Memory />
                </ElementButton>
            </div>
        </section>
    );
};
