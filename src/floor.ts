import * as THREE from "three";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Behaviour, instantiate, joinShaders } from "./lib";
import worley_s from "./shaders/lib/worley.glsl";
import grass_vs from "./shaders/grass.vs";
import grass_fs from "./shaders/grass.fs";

const GRASS_COLOR = 0x3d8b38;
const GRASS_TIP_COLOR = 0x7ec53c;

export class Grass extends THREE.Mesh implements Behaviour {
    public static SIZE = 10;
    private static GRASS_DENSITY = 100; // How many blades per m^2

    private static BLADE_SIZE = new THREE.Vector2(0.2, 0.8);
    private static BLADE_HEIGHT_MULTIPLIER_DEVIATION = 0.1;
    private static BLADE_ROTATION_DEVIATION = 0.2; // +- how much to add to the rotation on each axis

    private static shaderUniforms = {
        u_colorBottom: { value: new THREE.Color(GRASS_COLOR) },
        u_colorTop: { value: new THREE.Color(GRASS_TIP_COLOR) },
        u_time: { value: 0 },
    };

    constructor() {
        super(
            new THREE.PlaneGeometry(Grass.SIZE, Grass.SIZE),
            new THREE.MeshStandardMaterial({
                color: GRASS_COLOR,
            })
        )

        this.receiveShadow = true;
        this.rotation.x = - Math.PI / 2;
        this.populateGrass();
    }

    update(delta: number): void {
        Grass.shaderUniforms.u_time.value += delta;
    }

    populateGrass() {
        const bladeCount = Math.pow(Grass.SIZE, 2) * Grass.GRASS_DENSITY;
        const blades = new Array(bladeCount);

        for (let i = 0; i < bladeCount; i++) {
            blades[i] = this.createBladeMesh(new THREE.Vector2(
                THREE.MathUtils.randFloat(-Grass.SIZE / 2, Grass.SIZE / 2),
                THREE.MathUtils.randFloat(-Grass.SIZE / 2, Grass.SIZE / 2),
            ));
        }

        instantiate(new THREE.Mesh(
            BufferGeometryUtils.mergeGeometries(blades),
            new THREE.ShaderMaterial({
                uniforms: Grass.shaderUniforms,
                vertexShader: joinShaders([worley_s, grass_vs]),
                fragmentShader: joinShaders([worley_s, grass_fs]),
                side: THREE.DoubleSide,
            })
        ), this);
    }

    createBladeMesh(position: THREE.Vector2) {
        const heightMultiplier = 1 + THREE.MathUtils.randFloat(-Grass.BLADE_HEIGHT_MULTIPLIER_DEVIATION, Grass.BLADE_HEIGHT_MULTIPLIER_DEVIATION);

        const geom = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            // First triangle
            Grass.BLADE_SIZE.x / 2, 0, 0,
            0, 0, Grass.BLADE_SIZE.y * heightMultiplier,
            -Grass.BLADE_SIZE.x / 2, 0, 0,
        ]);
        geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

        geom.rotateX(THREE.MathUtils.randFloat(-Grass.BLADE_ROTATION_DEVIATION, Grass.BLADE_ROTATION_DEVIATION));
        geom.rotateY(THREE.MathUtils.randFloat(-Grass.BLADE_ROTATION_DEVIATION, Grass.BLADE_ROTATION_DEVIATION));
        geom.translate(position.x, position.y, 0);

        geom.computeVertexNormals();

        return geom;
    }
}