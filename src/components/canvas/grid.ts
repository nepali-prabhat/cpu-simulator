import { APP_BG_COLOR_PALETTE_MAP, COLOR_PALETTE } from "@/colors";
import { RoughCanvas } from "roughjs/bin/canvas";

export const strokeGrid = (
    context: CanvasRenderingContext2D,
    gridSize: number,

    offsetX: number,
    offsetY: number,

    width: number,
    height: number,

    bgColor?: string,
    rc?: RoughCanvas | null
) => {
    const strokeColor = getStrokeColor(bgColor);
    context.save();
    context.strokeStyle = strokeColor;
    context.beginPath();
    for (let x = offsetX; x < offsetX + width + gridSize * 2; x += gridSize) {
        if (rc) {
            rc.line(x, offsetY - gridSize, x, offsetY + height + gridSize * 2, {
                seed: 2,
                roughness: 1.5,
                bowing: 0.5,
                stroke: strokeColor,
            });
        } else {
            context.moveTo(x, offsetY - gridSize);
            context.lineTo(x, offsetY + height + gridSize * 2);
        }
    }
    for (let y = offsetY; y < offsetY + height + gridSize * 2; y += gridSize) {
        if (rc) {
            rc.line(offsetX - gridSize, y, offsetX + width + gridSize * 2, y, {
                seed: 2,
                roughness: 1.5,
                bowing: 0.5,
                stroke: strokeColor,
            });
        } else {
            context.moveTo(offsetX - gridSize, y);
            context.lineTo(offsetX + width + gridSize * 2, y);
        }
    }
    context.stroke();
    context.restore();
};

function getStrokeColor(bgColor?: string) {
    let strokeColor = COLOR_PALETTE.gray[0];
    if (bgColor && APP_BG_COLOR_PALETTE_MAP[bgColor]) {
        const paletteColor = COLOR_PALETTE[APP_BG_COLOR_PALETTE_MAP[bgColor]];
        if (Array.isArray(paletteColor)) {
            strokeColor = paletteColor[0];
        }
    }
    return strokeColor;
}

export const dotsGrid = (
    context: CanvasRenderingContext2D,
    gridSize: number,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    bgColor?: string,
    rc?: RoughCanvas | null
) => {
    context.save();
    let strokeColor = getStrokeColor(bgColor);
    context.fillStyle = strokeColor;
    context.beginPath();
    for (let x = offsetX; x < offsetX + width + gridSize * 2; x += gridSize) {
        for (
            let y = offsetY;
            y < offsetY + height + gridSize * 2;
            y += gridSize
        ) {
            if (rc) {
                const width = 2;
                rc.rectangle(x - width / 2, y - width / 2, width, width, {
                    seed: 1,
                    roughness: 2,
                    stroke: strokeColor,
                });
            } else {
                context.fillRect(x - 0.5, y - 0.5, 1, 1);
            }
        }
    }
    context.restore();
};
