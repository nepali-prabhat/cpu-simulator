import { useLayoutEffect, useRef, useState } from "react";
import { HamburgerMenu } from "./hamburgerMenu";
import { MenuInput } from "./menuInput";
import { ElementConfig } from "./ElementConfig/elementConfig";

function useObservePaletteHeight() {
    const [top, setTop] = useState<number>(0);
    const palettePortalRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        let observer: ResizeObserver | undefined;
        if (palettePortalRef.current && menuRef.current) {
            observer = new ResizeObserver((elements) => {
                setTop(
                    elements[0]?.target.getBoundingClientRect().bottom ||
                    menuRef.current?.getBoundingClientRect().bottom ||
                    100 // should never reach here. Render with top 100 to visually show there is some error
                );
            });
            observer.observe(palettePortalRef.current, {});
        }
        return () => {
            observer && observer.disconnect();
        };
    }, []);

    return { top, palettePortalRef, menuRef };
}

export const Menu = () => {
    const { palettePortalRef, menuRef, top } = useObservePaletteHeight();

    return (
        <>
            <section
                ref={menuRef}
                id="menu-portal-container"
                className="flex absolute top-0 left-0 gap-0.5 justify-center items-stretch py-1.5 px-1.5 m-1 bg-white rounded-br-lg border border-gray-300"
            >
                <HamburgerMenu ref={palettePortalRef} />
                <MenuInput />
            </section>
            <ElementConfig top={top} />
        </>
    );
};
