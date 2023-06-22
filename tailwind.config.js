/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require("open-color/open-color")],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-recursive)"],
            },
            colors: {
                transparent: "transparent",
                current: "currentColor",
            },
        },
    },
    plugins: [],
};
