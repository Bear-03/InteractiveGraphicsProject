//import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

export class Gui {
    private stats: Stats = new Stats();
    private menu: GUI = new GUI();
    private menuState = { showFps: true };

    constructor() {
        document.body.appendChild(this.stats.dom);

        const debugFolder = this.menu.addFolder("Debug");
        debugFolder.add(this.menuState, "showFps").name("Show FPS").onChange((v) => {
            this.stats.dom.style.visibility = v ? "visible" : "hidden";
        });
    }

    beforeUpdate() {
        this.stats.begin()
    }

    afterUpdate() {
        this.stats.end();
    }
}