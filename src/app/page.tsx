"use client";
import { DevTools as JotaiDevTools, useAtomsDebugValue } from "jotai-devtools";
import Canvas from "@/components/canvas/canvas";
import { Footer } from "@/components/footer/footer";
import { useEffect, useState } from "react";
import Providers from "./providers";
import { Menu } from "@/components/menu/menu";
import dynamic from "next/dynamic";

const DebugAtoms = () => {
    useAtomsDebugValue();

    const disable = true;
    const [show, setShow] = useState(false);
    useEffect(() => {
        setShow(true);
    }, []);
    return show && !disable ? <JotaiDevTools /> : null;
};

function ClientOnly(props: React.PropsWithChildren) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        setShow(true);
    }, []);

    return show ? props.children : <div>TODO: more elegant solution</div>;
}

function Home() {
    return (
            <Providers>
                <main className={`relative w-screen h-screen overflow-hidden`}>
                    <DebugAtoms />
                    <Canvas />
                    <Menu />
                    <Footer />
                </main>
            </Providers>
    );
}

// export default Home;
export default dynamic(() => Promise.resolve(Home), { ssr: false });
