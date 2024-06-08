import * as THREE from "three";
import { Behaviour } from "./lib";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { gui, renderer } from "./main";

export class Camera extends THREE.PerspectiveCamera implements Behaviour {
    private controls: OrbitControls;

    constructor() {
        super(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.position.z = 8;
        this.position.y = -gui.options.ground.size.value / 2 - 2;

        this.controls = new OrbitControls(this, renderer.domElement);
        this.controls.listenToKeyEvents(window);
        this.controls.enableDamping = true;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.2;
    }

    getLookDirection(): THREE.Vector3 {
        return new THREE.Vector3(0, 0, -1).applyEuler(this.rotation);
    }

    update(delta: number): void {
        this.controls.update(delta);
    }
}