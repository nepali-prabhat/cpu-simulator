import oc from "open-color";
import { Merge } from "./utilTypes";

export const ELEMENTS_PALETTE_SHADE_INDEXES = [1, 3, 5, 7, 9] as const;

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

export const GHOST_ELEMENT_COLOR = oc.gray[6];

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

export const APP_BG_FG_COLOR_MAP: {
    [key: string]: [keyof oc, number];
} = {
    "#ffffff": ["gray", 3],
    [oc.gray[0]]: ["gray", 3],
    [oc.cyan[0]]: ["blue", 2],
    [oc.yellow[0]]: ["orange", 2],
    [oc.pink[0]]: ["red", 2],
};
export const APP_BG_COLOR_PALETTE = Object.keys(APP_BG_FG_COLOR_MAP);

export function getPatternColor(bgColor?: string) {
    let strokeColor = COLOR_PALETTE.gray[1];
    if (bgColor && APP_BG_FG_COLOR_MAP[bgColor]) {
        const [color, index] = APP_BG_FG_COLOR_MAP[bgColor];
        if (oc[color]) {
            strokeColor = oc[color][index];
        }
    }
    return strokeColor;
}
function hasDefaultHighlight(bgColor?: string) {
    if (bgColor && APP_BG_COLOR_PALETTE[0] === bgColor) {
        return true;
    } else {
        return false;
    }
}
export function getHighlightFGColor(
    bgColor?: string,
    defaultColor: string = oc.blue[3]
) {
    if (hasDefaultHighlight(bgColor)) {
        return defaultColor;
    } else {
        let strokeColor = defaultColor;
        if (bgColor && APP_BG_FG_COLOR_MAP[bgColor]) {
            const [color, index] = APP_BG_FG_COLOR_MAP[bgColor];
            strokeColor = oc[color][index + 1] || strokeColor;
        }
        return strokeColor;
    }
}
export function getHighlightBGColor(
    bgColor?: string,
    defaultColor: string = oc.blue[9]
) {
    if (hasDefaultHighlight(bgColor)) {
        return defaultColor;
    } else {
        let fillColor;
        if (bgColor && APP_BG_FG_COLOR_MAP[bgColor]) {
            const [color] = APP_BG_FG_COLOR_MAP[bgColor];
            fillColor = oc[color][9] || fillColor;
        }
        return fillColor || defaultColor;
    }
}
export function reduceOpacityOfHexColor(hexColor: string) {
    return hexColor + "0f";
}

const elementsColorIndex = 4;
export const ELEMENTS_COLOR_PALETTE: ColorTuple = [
    COLOR_PALETTE.black,
    COLOR_PALETTE.red[elementsColorIndex],
    COLOR_PALETTE.green[elementsColorIndex],
    COLOR_PALETTE.blue[elementsColorIndex],
    COLOR_PALETTE.yellow[elementsColorIndex],
];
