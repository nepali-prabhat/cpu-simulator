import { RoughCanvas } from "roughjs/bin/canvas";

export const strokeGrid = (
    context: CanvasRenderingContext2D,
    gridSize: number,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    rc?: RoughCanvas | null
) => {
    context.save();
    context.strokeStyle = "rgba(0,0,0,0.1)";
    context.beginPath();
    for (let x = offsetX; x < offsetX + width + gridSize * 2; x += gridSize) {
        if (rc) {
            rc.line(x, offsetY - gridSize, x, offsetY + height + gridSize * 2, {
                seed: 3,
                roughness: 1,
                stroke: "rgba(0,0,0,0.1)",
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
                roughness: 1,
                stroke: "rgba(0,0,0,0.1)",
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
    rc?: RoughCanvas | null
) => {
    context.save();
    context.fillStyle = "rgba(0,0,0,0.25)";
    context.beginPath();
    for (let x = offsetX; x < offsetX + width + gridSize * 2; x += gridSize) {
        for (
            let y = offsetY;
            y < offsetY + height + gridSize * 2;
            y += gridSize
        ) {
            if (rc) {
                rc.rectangle(x - 0.5, y - 0.5, 1, 1, {
                    seed: 1,
                    roughness: 0.5,
                    stroke: "rgba(0,0,0,0.1)",
                });
            } else {
                context.fillRect(x - 0.5, y - 0.5, 1, 1);
            }
        }
    }
    context.restore();
};
