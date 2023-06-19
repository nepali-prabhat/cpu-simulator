import "./globals.scss";
import { Recursive } from "next/font/google";

const recursive = Recursive({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-recursive",
});

export const metadata = {
    title: "CPU simulator",
    description: "A CPU simulator by Prabhat Pandey",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${recursive.variable}`} style={{fontSize: "14px"}}>
            <body>{children}</body>
        </html>
    );
}
