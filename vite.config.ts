import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import glsl from "vite-plugin-glsl";

export default defineConfig({
    root: "src",
    publicDir: "../public",
    build: {
        outDir: "../dist",
    },
    plugins: [
        glsl(),
        checker({
            typescript: true,
        })
    ],
});
