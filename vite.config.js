import checker from "vite-plugin-checker";
import glsl from "vite-plugin-glsl";

export default {
    root: "src",
    publicDir: "../public",
    build: {
        outDir: "../dist"
    },
    plugins: [
        glsl(),
        checker({
            typescript: true,
        })
    ],
    server: {
        watch: {
            usePolling: true,
        }
    },

}