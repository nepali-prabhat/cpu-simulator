/** @type {import('next').NextConfig} */
const nextConfig = {
    // Required for UI css to be transpiled correctly 👇
    transpilePackages: ["jotai-devtools"],
};

module.exports = nextConfig;
