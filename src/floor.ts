import * as THREE from "three";
import { Behaviour, instantiate } from "./lib";
import grass_vs from "./shaders/grass.vs";
import grass_fs from "./shaders/grass.fs";

const GRASS_COLOR = 0x3d8b38;
const GRASS_TIP_COLOR = 0x7ec53c;

export class Floor extends THREE.Mesh implements Behaviour {
    public static SIZE = 10;
    private static GRASS_DENSITY = 30; // How many blades per m^2
    private static shaderUniforms = {
        u_colorBottom: { value: new THREE.Color(GRASS_COLOR) },
        u_colorTop: { value: new THREE.Color(GRASS_TIP_COLOR) },
        u_time: { value: 0 },
    };

    constructor() {
        super(
            new THREE.PlaneGeometry(Floor.SIZE, Floor.SIZE),
            new THREE.MeshStandardMaterial({
                color: GRASS_COLOR,
            })
        )

        this.receiveShadow = true;
        this.rotation.x = - Math.PI / 2;
        this.populateGrass();
    }

    update(delta: number): void {
        Floor.shaderUniforms.u_time.value += delta;
    }

    populateGrass() {
        const bladeCount = Math.pow(Floor.SIZE, 2) * Floor.GRASS_DENSITY;

        for (let i = 0; i < bladeCount; i++) {
            instantiate(new GrassBlade(new THREE.Vector3(
                THREE.MathUtils.randFloat(-Floor.SIZE / 2, Floor.SIZE / 2),
                THREE.MathUtils.randFloat(-Floor.SIZE / 2, Floor.SIZE / 2),
                0,
            )), this);
        }
    }
}

class GrassBlade extends THREE.Mesh implements Behaviour {
    private static SIZE = new THREE.Vector2(0.1, 1);
    private static HEIGHT_MULTIPLIER_DEVIATION = 0.1;
    private static ROTATION_DEVIATION = 0.2; // +- how much to add to the rotation on each axis

    private static shaderUniforms = {
        u_colorBottom: { value: new THREE.Color(GRASS_COLOR) },
        u_colorTop: { value: new THREE.Color(GRASS_TIP_COLOR) },
        u_time: { value: 0 },
    };

    constructor(position: THREE.Vector3) {
        const heightMultiplier = 1 + THREE.MathUtils.randFloat(-GrassBlade.HEIGHT_MULTIPLIER_DEVIATION, GrassBlade.HEIGHT_MULTIPLIER_DEVIATION);

        const geom = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            // First triangle
            GrassBlade.SIZE.x / 2, 0, 0,
            0, 0, GrassBlade.SIZE.y * heightMultiplier,
            -GrassBlade.SIZE.x / 2, 0, 0,
        ]);
        geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        geom.computeVertexNormals();


        super(
            geom,
            new THREE.ShaderMaterial({
                uniforms: GrassBlade.shaderUniforms,
                vertexShader: grass_vs,
                fragmentShader: grass_fs,
                side: THREE.DoubleSide,
            }),
        );

        this.position.copy(position);
        this.rotation.set(
            THREE.MathUtils.randFloat(-GrassBlade.ROTATION_DEVIATION, GrassBlade.ROTATION_DEVIATION),
            THREE.MathUtils.randFloat(-GrassBlade.ROTATION_DEVIATION, GrassBlade.ROTATION_DEVIATION),
            THREE.MathUtils.randFloat(-GrassBlade.ROTATION_DEVIATION, GrassBlade.ROTATION_DEVIATION),
        );
    }

    update(delta: number): void {
        GrassBlade.shaderUniforms.u_time.value += delta;
    }
}