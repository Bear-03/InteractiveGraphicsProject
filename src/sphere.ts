import * as THREE from "three";
import { Spatial } from "./lib";

export class Sphere extends THREE.Mesh implements Spatial {
    public radius: number;

    constructor(radius: number) {
        super(
            new THREE.SphereGeometry(radius),
            new THREE.MeshStandardMaterial({
                color: 0xff0000,
                roughness: 0.2,
                metalness: 0.1,
            })
        )

        this.radius = radius;
    }

    bottom(): THREE.Vector3 {
        const bottom = this.position.clone();
        bottom.z -= this.radius;
        return bottom
    }
}