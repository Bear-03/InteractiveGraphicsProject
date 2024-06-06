import * as THREE from "three";
import { Grass } from "./grass";
import { debugMode, instantiate, behaviours } from "./lib";
import { Sphere } from "./sphere";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { Camera } from "./camera";

export const renderer = new THREE.WebGLRenderer({ antialias: true });
export const scene = new THREE.Scene();
export const camera = new Camera();

const clock = new THREE.Clock();
let stats: Stats;

if (debugMode) {
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
}

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const SKY_COLOR = 0x88ddda;

function start(): void {
    scene.background = new THREE.Color(SKY_COLOR);

    instantiate(new THREE.AmbientLight(0xffffff, 0.5), scene);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-10, 10, 10);
    light.castShadow = true;
    instantiate(light, scene);

    if (debugMode) {
        const sunlight_helper = new THREE.DirectionalLightHelper(light, 5);
        instantiate(sunlight_helper, scene);
    }

    const grass = new Grass();
    instantiate(grass, scene);

    const sphere = new Sphere(1);
    sphere.position.set(0, sphere.radius, 0);
    instantiate(sphere, scene);
}

function update(delta: number): void {
    for (const behaviour of behaviours) {
        behaviour.update(delta)
    }
}

start();

function animate() {
    if (debugMode) {
        stats.begin();
    }

    update(clock.getDelta());

    if (debugMode) {
        stats.end();
    }

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);