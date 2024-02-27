import { getPatternColor } from "@/colors";
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
    const strokeColor = getPatternColor(bgColor);
    context.save();
    context.strokeStyle = strokeColor;
    context.beginPath();
    for (let x = offsetX; x < offsetX + width + gridSize * 2; x += gridSize) {
        if (rc) {
            rc.line(x, offsetY - gridSize, x, offsetY + height + gridSize * 2, {
                seed: 2,
                roughness: 0,
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

export const dotsGrid = (
    context: CanvasRenderingContext2D,
    gridSize: number,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    zoom: number,
    bgColor?: string,
    rc?: RoughCanvas | null
) => {
    if (zoom < 0.5) {
        return;
    }
    context.save();
    let strokeColor = getPatternColor(bgColor);
    context.fillStyle = bgColor || strokeColor + "00";
    context.strokeStyle = strokeColor;
    context.beginPath();
    
    // caluclate the number of dots
    const a = offsetX + width + gridSize * 2;
    const b = offsetY + height + gridSize * 2;
    const numberOfDots = (a * b) / gridSize / (gridSize ^ 2);

    // use rough canvas based on number of dots to draw.
    const useRc = numberOfDots < 2500;
    
    for (let x = offsetX; x < a; x += gridSize) {
        for (let y = offsetY; y < b; y += gridSize) {
            if (useRc && rc && zoom > 0.75) {
                const width = 2;
                rc.rectangle(x - width / 2, y - width / 2, width, width, {
                    seed: 1,
                    roughness: 2,
                    stroke: strokeColor,
                });
            } else {
                const size = 2;
                const pad = size / 2;
                context.fillRect(x - pad, y - pad, size, size);
                context.strokeRect(x - pad, y - pad, size, size);
            }
        }
    }
    context.restore();
};
