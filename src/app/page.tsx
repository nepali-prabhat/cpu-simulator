"use client";
import { DevTools as JotaiDevTools, useAtomsDebugValue } from "jotai-devtools";
import Canvas from "@/components/canvas/canvas";
import { Footer } from "@/components/footer/footer";
import { useEffect, useState } from "react";
import Providers from "./providers";

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
        <ClientOnly>
            <Providers>
                <main className={`relative w-screen h-screen overflow-hidden`}>
                    <DebugAtoms />
                    <section className="absolute bottom-1 left-1">
                        <Canvas />
                    </section>
                    <section className="absolute bottom-1 left-1">
                        <Footer />
                    </section>
                </main>
            </Providers>
        </ClientOnly>
    );
}

export default Home;
