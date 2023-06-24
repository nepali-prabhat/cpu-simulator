import { useCanvas } from "./useCanvas";
import dynamic from "next/dynamic";

export function Canvas() {
    const {
        handlePointerDown,
        handlePointerUp,
        handlePointerMove,
        handlePointerLeave,
        handlePointerEnter,
        canvasRef,
        canvasProperties,
        handleCanvasContextMenu,
    } = useCanvas({
        offset: {},
        // { x: 2.5, y: -1 }
    });

    return (
        <section className="absolute bottom-1 left-1">
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
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                onPointerUp={handlePointerUp}
            // onPointerCancel={(e) => console.log("cancel: ", e)}
            >
                screen for cpu simulation
            </canvas>
        </section>
    );
}

export default dynamic(() => Promise.resolve(Canvas), { ssr: false });
