import * as THREE from "three";
import { Behaviour } from "./lib";
import { Grass } from "./grass";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { renderer } from "./main";

export class Camera extends THREE.PerspectiveCamera implements Behaviour {
    private controls: OrbitControls;

    constructor() {
        super(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.position.y = 6;
        this.position.z = Grass.SIZE / 2 + 0.5;

        this.rotation.x = -0.9;

        this.controls = new OrbitControls(this, renderer.domElement);
        this.controls.listenToKeyEvents(window);
        this.controls.enableDamping = true;
    }

    update(delta: number): void {
        this.controls.update(delta);
    }
}