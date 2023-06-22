import { APP_BG_COLOR_PALETTE, ColorTuple } from "@/colors";
import { bgColorAtom } from "@/state/scene";
import { PrimitiveAtom, useAtomValue, useSetAtom } from "jotai";
import { twMerge } from "tailwind-merge";

const ColorButton = (props: {
    isSelected: boolean;
    key: string;
    color: string;
    colorAtom: PrimitiveAtom<string | undefined>;
}) => {
    const setColor = useSetAtom(props.colorAtom);
    return (
        <button
            onClick={() => setColor(props.color)}
            key={props.key}
            className={twMerge(
                "rounded border border-gray-300 h-[24px] w-[24px]",
                "hover:ring-1",
                props.isSelected && `ring-2 ring-offset-white ring-offset-1`
            )}
            style={{ background: props.color }}
        />
    );
};

const ColorPicker = (props: {
    defaultOptions: ColorTuple;
    colorAtom: PrimitiveAtom<string | undefined>;
}) => {
    const color = useAtomValue(props.colorAtom);
    return (
        <div className="flex gap-2 p-1 px-1">
            {props.defaultOptions.map((c) => (
                <ColorButton
                    colorAtom={props.colorAtom}
                    isSelected={color === c}
                    key={`color_palette_${props.colorAtom}_${c}`}
                    color={c}
                />
            ))}
        </div>
    );
};

export const Actions = () => {
    return (
        <div className="grid gap-2">
            <div>
                <h1 className="text-gray-700">Background color</h1>
                <ColorPicker
                    defaultOptions={APP_BG_COLOR_PALETTE}
                    colorAtom={bgColorAtom}
                />
            </div>
        </div>
    );
};
