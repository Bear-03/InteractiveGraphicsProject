import * as THREE from "three";
import { Behaviour, Spatial } from "./lib";
import { Trajectory } from "./trajectories";

export class Sphere extends THREE.Mesh implements Behaviour, Spatial {
    public radius: number;
    private trajectory: Trajectory;

    constructor(radius: number, color: THREE.Color, trajectory: Trajectory) {
        super(
            new THREE.SphereGeometry(radius),
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.2,
                metalness: 0.1,
            })
        )

        this.radius = radius;
        this.trajectory = trajectory;
    }

    update(delta: number): void {
        this.trajectory.step(delta);
        this.position.copy(this.trajectory.position());
    }

    center(): THREE.Vector3 {
        return this.position.clone();
    }
}