import * as THREE from "three";

export interface Trajectory {
    step(delta: number): void,
    position(): THREE.Vector3,
}

export class CircularTrajectoryZ implements Trajectory {
    private angle: number;
    private center: THREE.Vector3;
    private radius: number;
    private speed: number;

    constructor(center: THREE.Vector3, radius: number, speed: number) {
        this.angle = 0;
        this.center = center;
        this.radius = radius;
        this.speed = speed;
    }

    step(delta: number): void {
        this.angle += this.speed * delta;
    }

    position(): THREE.Vector3 {
        return new THREE.Vector3(
            this.center.x + this.radius * Math.cos(this.angle),
            this.center.y + this.radius * Math.sin(this.angle),
            this.center.z,
        )
    }
}

export class LinearTrajectory implements Trajectory {
    private t: number;
    private incrementDirection: number;
    private speed: number;
    private startPoint: THREE.Vector3;
    private endPoint: THREE.Vector3;

    constructor(speed: number, startPoint: THREE.Vector3, endPoint: THREE.Vector3) {
        this.t = 0;
        this.incrementDirection = 1;
        this.speed = speed;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }

    step(delta: number): void {
        this.t = THREE.MathUtils.clamp(this.t + this.incrementDirection * this.speed * delta, 0, 1);

        if (this.t === 0 || this.t === 1) {
            this.incrementDirection = -this.incrementDirection;
        }
    }

    position(): THREE.Vector3 {
        return new THREE.Vector3(
            THREE.MathUtils.lerp(this.startPoint.x, this.endPoint.x, this.t),
            THREE.MathUtils.lerp(this.startPoint.y, this.endPoint.y, this.t),
            THREE.MathUtils.lerp(this.startPoint.z, this.endPoint.z, this.t),
        )
    }
}