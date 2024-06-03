import checker from "vite-plugin-checker";

export default {
    root: "src",
    build: {
        outDir: "../dist"
    },
    plugins: [
        checker({
            typescript: true,
        })
    ],
}