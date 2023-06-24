import { ColorTuple } from "@/colors";
import { twMerge } from "tailwind-merge";

const ColorButton = (props: {
    isSelected: boolean;
    color: string;
    onChange: (v: string) => void;
}) => {
    return (
        <button
            onClick={() => props.onChange(props.color)}
            className={twMerge(
                "rounded border border-gray-300 h-[24px] w-[24px]",
                "hover:ring-1",
                props.isSelected &&
                `ring-2 ring-blue-200`
            )}
            style={{ background: props.color }}
        />
    );
};

export const ColorPicker = (props: {
    name: string;
    defaultOptions: ColorTuple;
    value: string | undefined;
    onChange: (v: string) => void;
}) => {
    return (
        <div className="flex gap-2 p-1 px-1">
            {props.defaultOptions.map((c) => (
                <ColorButton
                    isSelected={props.value === c}
                    key={`color_palette${props.name}_${c}`}
                    color={c}
                    onChange={props.onChange}
                />
            ))}
        </div>
    );
};
