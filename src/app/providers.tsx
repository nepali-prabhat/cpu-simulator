"use client";
import { Provider as JotaiProvider } from "jotai";

const Providers = ({ children }: React.PropsWithChildren) => {
    return <JotaiProvider>{children}</JotaiProvider>;
};

export default Providers;
