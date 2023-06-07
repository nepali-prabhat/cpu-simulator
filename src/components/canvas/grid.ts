export const strokeGrid = (
    context: CanvasRenderingContext2D,
    gridSize: number,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number
) => {
    context.save();
    context.strokeStyle = "rgba(0,0,0,0.1)";
    context.beginPath();
    for (let x = offsetX; x < offsetX + width + gridSize * 2; x += gridSize) {
        context.moveTo(x, offsetY - gridSize);
        context.lineTo(x, offsetY + height + gridSize * 2);
    }
    for (let y = offsetY; y < offsetY + height + gridSize * 2; y += gridSize) {
        context.moveTo(offsetX - gridSize, y);
        context.lineTo(offsetX + width + gridSize * 2, y);
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
    height: number
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
            context.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
    }
    context.restore();
};
