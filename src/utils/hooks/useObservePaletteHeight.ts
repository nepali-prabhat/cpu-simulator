import { menuContainerId, paletteContentId } from "@/constants/constants";
import { useLayoutEffect, useState } from "react";

export function useObservePaletteHeight() {
    const [top, setTop] = useState<number | undefined>(0);

    useLayoutEffect(() => {
        let observer: ResizeObserver | undefined;
        const palettePortalRef = {
            current: document.getElementById(paletteContentId),
        };
        const menuRef = {
            current: document.getElementById(menuContainerId),
        };
        if (palettePortalRef.current && menuRef.current) {
            observer = new ResizeObserver((elements) => {
                const newTop =
                    elements[0]?.target.getBoundingClientRect().bottom ||
                    menuRef.current?.getBoundingClientRect().bottom ||
                    undefined;
                setTop(newTop);
            });
            observer.observe(palettePortalRef.current, {});
        }
        return () => {
            observer && observer.disconnect();
        };
    }, []);

    return { top };
}
