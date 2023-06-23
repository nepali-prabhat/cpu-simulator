import { APP_BG_COLOR_PALETTE } from "@/colors";
import { ColorPicker } from "@/components/colorPicker/colorPicker";
import { bgColorAtom } from "@/state/scene";
import { useAtom } from "jotai";

const BackgroundColor = () => {
    const [bgColor, setBgColor] = useAtom(bgColorAtom);
    return (
        <>
            <h1 className="text-gray-700">Background color</h1>
            <ColorPicker
                name="bgColor"
                defaultOptions={APP_BG_COLOR_PALETTE}
                value={bgColor}
                onChange={setBgColor}
            />
        </>
    );
};

export const Actions = () => {
    return (
        <div className="grid gap-2">
            <div>
                <BackgroundColor />
            </div>
        </div>
    );
};
