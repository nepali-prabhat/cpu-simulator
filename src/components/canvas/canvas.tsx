import { useCanvas } from "./useCanvas";
import dynamic from "next/dynamic";

export function Canvas() {
    const {
        handlePointerDown,
        handlePointerUp,
        handlePointerMove,
        canvasRef,
        canvasProperties,
        handleCanvasContextMenu,
    } = useCanvas();

    return (
        <section>
            <canvas
                ref={canvasRef}
                className={`bg-none`}
                id="root"
                width={canvasProperties.dimension.width}
                height={canvasProperties.dimension.height}
                onContextMenu={handleCanvasContextMenu}
                // onClick={handleClick}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            // onPointerCancel={(e) => console.log("cancel: ", e)}
            >
                screen for cpu simulation
            </canvas>
        </section>
    );
}

export default dynamic(() => Promise.resolve(Canvas), { ssr: false });
