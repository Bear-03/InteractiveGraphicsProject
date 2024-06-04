import * as THREE from "three";
import { Grass } from "./grass";
import { debugMode, instantiate, behaviours } from "./lib";
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { Cube } from "./cube";
import Stats from "three/examples/jsm/libs/stats.module.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });
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

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let controls: FlyControls;

const SKY_COLOR = 0x88ddda;

function start(): void {
    scene.background = new THREE.Color(SKY_COLOR);

    camera.position.y = 6;
    camera.position.z = Grass.SIZE / 2 + 0.5;
    camera.rotation.x = -0.9;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-10, 10, 10);
    light.castShadow = true;
    instantiate(light, scene);

    instantiate(new THREE.AmbientLight(0xffffff, 0.5), scene);

    if (debugMode) {
        const sunlight_helper = new THREE.DirectionalLightHelper(light, 5);
        instantiate(sunlight_helper, scene);

        controls = new FlyControls(camera, renderer.domElement);
        controls.movementSpeed = 100;
        controls.rollSpeed = Math.PI / 2;
        controls.autoForward = false;
        controls.dragToLook = true;
    }

    instantiate(new Grass(), scene);
    const cube = new Cube();
    cube.position.set(3, Cube.SIZE / 2, -3);
    instantiate(cube, scene);
}

function update(delta: number): void {
    controls.update(0.01);

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