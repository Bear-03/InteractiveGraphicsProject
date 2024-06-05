import * as THREE from "three";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Behaviour, Range, Spatial, instantiate, joinShaders, spatials } from "./lib";
import map_range_s from "./shaders/lib/map_range.glsl";
import worley_s from "./shaders/lib/worley.glsl";
import grass_vs from "./shaders/grass.vs";
import grass_fs from "./shaders/grass.fs";

const GRASS_COLOR = 0x3d8b38;
const GRASS_TIP_COLOR = 0x7ec53c;

type GrassShaderUniforms = {
    u_colorBottom: { value: THREE.Color },
    u_colorTop: { value: THREE.Color },
    u_time: { value: number },
    u_spatials: { value: Spatial[] },
    u_spatials_len: { value: number },
}

export class Grass extends THREE.Mesh implements Behaviour {
    public static SIZE = 15;
    private static MARGIN = 0.2;
    private static GRASS_DENSITY = 150; // How many blades per m^2
    private static MAX_SPATIALS = 10;

    private static BLADE_SIZE = new THREE.Vector2(0.2, 0.5);
    private static BLADE_HEIGHT_MULTIPLIER_DEVIATION: Range<number> = { min: -0.5, max: 0 };
    // +- how much to add to the rotation on each axis
    private static BLADE_ROTATION: Range<THREE.Vector3> = {
        min: new THREE.Vector3(-Math.PI / 4, -0.2, 0),
        max: new THREE.Vector3(Math.PI / 4, 0.2, Math.PI)
    };

    public shaderUniforms: GrassShaderUniforms;

    constructor() {
        super(
            new THREE.PlaneGeometry(Grass.SIZE, Grass.SIZE),
            new THREE.MeshStandardMaterial({
                color: GRASS_COLOR,
            })
        )

        this.shaderUniforms = {
            u_colorBottom: { value: new THREE.Color(GRASS_COLOR) },
            u_colorTop: { value: new THREE.Color(GRASS_TIP_COLOR) },
            u_time: { value: 0 },
            u_spatials: { value: this.getSpatialsForShader() },
            u_spatials_len: { value: spatials.length },
        };

        this.receiveShadow = true;
        this.rotation.x = - Math.PI / 2;
        this.populateGrass();
    }

    // Extends the spatials array with dummy values so it can be loaded to glsl
    getSpatialsForShader(): Spatial[] {
        const arr = [...spatials];
        arr.length = Grass.MAX_SPATIALS;

        return arr.fill({
            position: new THREE.Vector3(),
            radius: 0
        },
            spatials.length,
            Grass.MAX_SPATIALS
        );
    }

    update(delta: number): void {
        this.shaderUniforms.u_time.value += delta;
        this.shaderUniforms.u_spatials.value = this.getSpatialsForShader();
        this.shaderUniforms.u_spatials_len.value = spatials.length;
    }

    populateGrass() {
        const bladeCount = Math.ceil(Math.pow(Grass.SIZE - 2 * Grass.MARGIN, 2) * Grass.GRASS_DENSITY);
        const blades = new Array(bladeCount);

        for (let i = 0; i < bladeCount; i++) {
            blades[i] = this.createBladeMesh(new THREE.Vector2(
                THREE.MathUtils.randFloatSpread(Grass.SIZE - Grass.MARGIN),
                THREE.MathUtils.randFloatSpread(Grass.SIZE - Grass.MARGIN),
            ));
        }

        instantiate(new THREE.Mesh(
            BufferGeometryUtils.mergeGeometries(blades),
            new THREE.ShaderMaterial({
                uniforms: this.shaderUniforms,
                vertexShader: joinShaders([map_range_s, worley_s, grass_vs]),
                fragmentShader: joinShaders([worley_s, grass_fs]),
                side: THREE.DoubleSide,
                transparent: true
            })
        ), this);
    }

    createBladeMesh(position: THREE.Vector2) {
        const heightMultiplier = 1 + THREE.MathUtils.randFloat(-Grass.BLADE_HEIGHT_MULTIPLIER_DEVIATION.min, Grass.BLADE_HEIGHT_MULTIPLIER_DEVIATION.max);

        const geom = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            // First triangle
            Grass.BLADE_SIZE.x / 2, 0, 0,
            0, 0, Grass.BLADE_SIZE.y * heightMultiplier,
            -Grass.BLADE_SIZE.x / 2, 0, 0,
        ]);
        geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

        geom.rotateX(THREE.MathUtils.randFloat(Grass.BLADE_ROTATION.min.x, Grass.BLADE_ROTATION.max.x));
        geom.rotateY(THREE.MathUtils.randFloat(Grass.BLADE_ROTATION.min.y, Grass.BLADE_ROTATION.max.y));
        geom.rotateZ(THREE.MathUtils.randFloat(Grass.BLADE_ROTATION.min.z, Grass.BLADE_ROTATION.max.z));
        geom.translate(position.x, position.y, 0);

        geom.computeVertexNormals();

        return geom;
    }
}