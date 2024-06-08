import * as THREE from "three";
import { Grass } from "./grass";
import { debugMode, instantiate, behaviours } from "./lib";
import { Sphere } from "./sphere";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { Camera } from "./camera";
import { CircularTrajectoryZ, LinearTrajectory } from "./trajectories";

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

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
    instantiate(camera, scene);
    scene.background = new THREE.Color(SKY_COLOR);

    instantiate(new THREE.AmbientLight(0xffffff, 0.5), scene);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-10, -10, 10);
    light.castShadow = true;
    instantiate(light, scene);

    if (debugMode) {
        const sunlight_helper = new THREE.DirectionalLightHelper(light, 5);
        instantiate(sunlight_helper, scene);
    }

    const grass = new Grass();
    instantiate(grass, scene);

    const sphereRadius = 1;

    const sphereCircular = new Sphere(
        sphereRadius,
        new THREE.Color(0xff0000),
        new CircularTrajectoryZ(
            new THREE.Vector3(0, 0, sphereRadius),
            3,
            0.5
        )
    );
    instantiate(sphereCircular, scene);

    const sphereLinear = new Sphere(
        sphereRadius,
        new THREE.Color(0x0000ff),
        new LinearTrajectory(
            0.5,
            new THREE.Vector3(0,
                0,
                sphereRadius
            ),
            new THREE.Vector3(0, 0, 3)
        )
    );
    instantiate(sphereLinear, scene);
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