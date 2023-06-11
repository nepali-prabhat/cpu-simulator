"use client";
import Canvas from "@/components/canvas/canvas";
import { Footer } from "@/components/footer/footer";

function Home() {
    return (
        <main className={`relative w-screen h-screen overflow-hidden`}>
            <section className="absolute bottom-1 left-1">
                <Canvas />
            </section>
            <section className="absolute bottom-1 left-1">
                <Footer />
            </section>
        </main>
    );
}

// TODO: resolve hydration errors by having the same layout during rendering in server and in client.
// ... use some sort of loader and wait for the canvas element to process before showing it in the browser.
export default Home;
// export default Home;
