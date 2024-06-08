import * as THREE from "three";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { Behaviour, MAX_SPATIALS, Range, instantiate, joinShaders, spatials } from "./lib";
import map_range_s from "./shaders/lib/map_range.glsl";
import random_s from "./shaders/lib/random.glsl";
import grass_vs from "./shaders/grass.vs";
import grass_fs from "./shaders/grass.fs";
import { gui } from "./main";

const FALLBACK_COLOR = 0xff00ff;

type SpatialShaderRepr = {
    center: THREE.Vector3,
    radius: number,
}

type GrassShaderUniforms = {
    u_time: { value: number },
    u_color_base: { value: THREE.Color },
    u_color_tip: { value: THREE.Color },
    u_spatials: { value: SpatialShaderRepr[] },
    u_spatials_len: { value: number },
    u_wind_strength: { value: number },
    u_wind_speed: { value: number },
}

export class Ground extends THREE.Mesh implements Behaviour {
    // +- how much to add to the rotation on each axis
    private static BLADE_ROTATION: Range<THREE.Vector3> = {
        min: new THREE.Vector3(-Math.PI / 4, -0.2, 0),
        max: new THREE.Vector3(Math.PI / 4, 0.2, Math.PI)
    };

    private shaderUniforms: GrassShaderUniforms;
    private groundGeometry: THREE.PlaneGeometry;
    private groundMaterial: THREE.MeshStandardMaterial;
    private grassGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();

    constructor() {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: FALLBACK_COLOR,
        });

        super(
            geometry,
            material,
        )
        this.groundGeometry = geometry;
        this.groundMaterial = material;
        this.receiveShadow = true;

        this.shaderUniforms = {
            u_time: { value: 0 },
            u_color_base: { value: new THREE.Color(FALLBACK_COLOR) },
            u_color_tip: { value: new THREE.Color(FALLBACK_COLOR) },
            u_spatials: { value: this.getSpatialsForShader() },
            u_spatials_len: { value: spatials.length },
            u_wind_strength: { value: 1.0 },
            u_wind_speed: { value: 0.6 },
        };


        this.initOptions();

        const bladeMesh = new THREE.Mesh(
            this.grassGeometry,
            new CustomShaderMaterial({
                baseMaterial: THREE.MeshStandardMaterial,
                uniforms: this.shaderUniforms,
                vertexShader: joinShaders([map_range_s, random_s, grass_vs]),
                fragmentShader: joinShaders([grass_fs]),
                silent: true,
                side: THREE.DoubleSide,
                transparent: true,
            }),
        );
        bladeMesh.receiveShadow = true;
        instantiate(bladeMesh, this);
    }

    // Extends the spatials array with dummy values so it can be loaded to glsl
    getSpatialsForShader(): SpatialShaderRepr[] {
        const arr = spatials.map((s) => ({
            center: s.center(),
            radius: s.radius,
        }));
        arr.length = MAX_SPATIALS;

        return arr.fill(
            {
                center: new THREE.Vector3(),
                radius: 0
            },
            spatials.length,
            MAX_SPATIALS
        );
    }

    update(delta: number): void {
        this.shaderUniforms.u_time.value += delta;
        this.shaderUniforms.u_spatials.value = this.getSpatialsForShader();
        this.shaderUniforms.u_spatials_len.value = spatials.length;
    }

    createGrassGeometry(density: number, bladeSize: THREE.Vector2, heightMultiplierRange: Range<number>, groundSize: number): THREE.BufferGeometry {
        const bladeCount = Math.ceil(Math.pow(groundSize, 2) * density);
        const blades = new Array(bladeCount);

        for (let i = 0; i < bladeCount; i++) {
            blades[i] = this.createBladeGeometry(new THREE.Vector3(
                THREE.MathUtils.randFloatSpread(groundSize),
                THREE.MathUtils.randFloatSpread(groundSize),
                0
            ),
                bladeSize,
                heightMultiplierRange,
            );
        }

        return BufferGeometryUtils.mergeGeometries(blades);
    }

    createBladeGeometry(position: THREE.Vector3, size: THREE.Vector2, heightMultiplierRange: Range<number>) {
        const heightMultiplier = 1 + THREE.MathUtils.randFloat(-heightMultiplierRange.min, heightMultiplierRange.max);

        const geom = new THREE.BufferGeometry();

        const vertices = new Float32Array([
            size.x / 2, 0, 0,
            0, 0, size.y * heightMultiplier,
            -size.x / 2, 0, 0,
        ]);
        const uvs = new Float32Array([
            0, 0,
            0.5, 1,
            1, 0,
        ]);

        const x = position.x;
        const y = position.y;
        const z = position.z;
        const blade_origin = new Float32Array([
            x, y, z,
            x, y, z,
            x, y, z,
        ]);

        geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
        geom.setAttribute("a_blade_origin", new THREE.BufferAttribute(blade_origin, 3));

        geom.rotateX(THREE.MathUtils.randFloat(Ground.BLADE_ROTATION.min.x, Ground.BLADE_ROTATION.max.x));
        geom.rotateY(THREE.MathUtils.randFloat(Ground.BLADE_ROTATION.min.y, Ground.BLADE_ROTATION.max.y));
        geom.rotateZ(THREE.MathUtils.randFloat(Ground.BLADE_ROTATION.min.z, Ground.BLADE_ROTATION.max.z));

        geom.translate(position.x, position.y, 0);

        geom.computeVertexNormals();

        return geom;
    }

    initOptions() {
        gui.options.ground.color.controller.onChange(() => this.onGroundColorChange());
        this.onGroundColorChange();

        gui.options.ground.size.controller.onChange(() => {
            this.onGroundGeometryChange();
            this.onBladeGeometryChange();
        });
        gui.options.ground.margin.controller.onChange(() => this.onGroundGeometryChange());
        this.onGroundGeometryChange();

        gui.options.blades.baseColor.controller.onChange(() => this.onBaseColorChange());
        this.onBaseColorChange();

        gui.options.blades.tipColor.controller.onChange(() => this.onTipColorChange());
        this.onTipColorChange();

        gui.options.blades.width.controller.onChange(() => this.onBladeGeometryChange());
        gui.options.blades.height.controller.onChange(() => this.onBladeGeometryChange());
        gui.options.blades.density.controller.onChange(() => this.onBladeGeometryChange());
        gui.options.blades.minHeightMultiplier.controller.onChange(() => this.onBladeGeometryChange());
        gui.options.blades.maxHeightMultiplier.controller.onChange(() => this.onBladeGeometryChange());
        this.onBladeGeometryChange();
    }

    onGroundColorChange() {
        this.groundMaterial.color.set(gui.options.ground.color.value);
    }

    onGroundGeometryChange() {
        const size = gui.options.ground.size.value;
        const margin = gui.options.ground.margin.value;
        this.groundGeometry.copy(new THREE.PlaneGeometry(size + margin, size + margin));
    }

    onBaseColorChange() {
        this.shaderUniforms.u_color_base.value.set(gui.options.blades.baseColor.value);
    }

    onTipColorChange() {
        this.shaderUniforms.u_color_tip.value.set(gui.options.blades.tipColor.value);
    }

    onBladeGeometryChange() {
        const bladeOptions = gui.options.blades;
        this.grassGeometry.copy(this.createGrassGeometry(
            bladeOptions.density.value,
            new THREE.Vector2(bladeOptions.width.value, bladeOptions.height.value),
            { min: bladeOptions.minHeightMultiplier.value, max: bladeOptions.maxHeightMultiplier.value },
            gui.options.ground.size.value,
        ));
    }
}