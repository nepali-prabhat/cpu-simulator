import oc from "open-color";
import { Merge } from "./utilTypes";

export const ELEMENTS_PALETTE_SHADE_INDEXES = [0, 2, 4, 6, 8] as const;

export type ColorPickerColor =
    | Exclude<keyof oc, "indigo" | "lime">
    | "transparent"
    | "bronze";
export type ColorShadesIndexes = [number, number, number, number, number];
export type ColorTuple = readonly [string, string, string, string, string];
export type ColorPalette = Merge<
    Record<ColorPickerColor, ColorTuple>,
    { black: string; white: string; transparent: string }
>;

export const getSpecificColorShades = (
    color: Exclude<
        ColorPickerColor,
        "transparent" | "white" | "black" | "bronze"
    >,
    indexArr: Readonly<ColorShadesIndexes>
) => {
    return indexArr.map((index) => oc[color][index]) as any as ColorTuple;
};

export const COLOR_PALETTE = {
    transparent: "transparent",
    black: "#1e1e1e",
    white: "#ffffff",
    // open-colors
    gray: getSpecificColorShades("gray", ELEMENTS_PALETTE_SHADE_INDEXES),
    red: getSpecificColorShades("red", ELEMENTS_PALETTE_SHADE_INDEXES),
    pink: getSpecificColorShades("pink", ELEMENTS_PALETTE_SHADE_INDEXES),
    grape: getSpecificColorShades("grape", ELEMENTS_PALETTE_SHADE_INDEXES),
    violet: getSpecificColorShades("violet", ELEMENTS_PALETTE_SHADE_INDEXES),
    blue: getSpecificColorShades("blue", ELEMENTS_PALETTE_SHADE_INDEXES),
    cyan: getSpecificColorShades("cyan", ELEMENTS_PALETTE_SHADE_INDEXES),
    teal: getSpecificColorShades("teal", ELEMENTS_PALETTE_SHADE_INDEXES),
    green: getSpecificColorShades("green", ELEMENTS_PALETTE_SHADE_INDEXES),
    yellow: getSpecificColorShades("yellow", ELEMENTS_PALETTE_SHADE_INDEXES),
    orange: getSpecificColorShades("orange", ELEMENTS_PALETTE_SHADE_INDEXES),
    // radix bronze shades 3,5,7,9,11
    bronze: ["#f8f1ee", "#eaddd7", "#d2bab0", "#a18072", "#846358"],
} as ColorPalette;

export const APP_BG_COLOR_PALETTE: ColorTuple = [
    "#ffffff",
    "#f8f9fa",
    "#f5faff",
    "#fffce8",
    "#fdf8f6",
];
const elementsColorIndex = 4;
export const ELEMENTS_COLOR_PALETTE: ColorTuple = [
    COLOR_PALETTE.black,
    COLOR_PALETTE.red[elementsColorIndex],
    COLOR_PALETTE.green[elementsColorIndex],
    COLOR_PALETTE.blue[elementsColorIndex],
    COLOR_PALETTE.yellow[elementsColorIndex],
];
