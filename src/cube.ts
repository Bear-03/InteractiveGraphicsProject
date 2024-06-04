import * as THREE from "three";

export class Cube extends THREE.Mesh {
    public static SIZE = 2;

    constructor() {
        super(
            new THREE.BoxGeometry(Cube.SIZE, Cube.SIZE, Cube.SIZE),
            new THREE.MeshStandardMaterial({
                color: 0xff0000,
            })
        )
    }
}