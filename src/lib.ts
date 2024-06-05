import * as THREE from "three";

export type Range<T> = { min: T, max: T };

export const debugMode = true;
export const behaviours: Behaviour[] = []
export const spatials: Spatial[] = []

export interface Behaviour extends THREE.Object3D {
    update(delta: number): void,
}

export interface Spatial extends THREE.Object3D {
    bottom(): THREE.Vector3,
    influenceRadius(): number,
}

function isBehaviour(obj: THREE.Object3D): obj is Behaviour {
    return (obj as Behaviour).update !== undefined;
}

function isSpatial(obj: THREE.Object3D): obj is Spatial {
    return (
        (obj as Spatial).bottom !== undefined &&
        (obj as Spatial).influenceRadius !== undefined
    );
}

export function instantiate(obj: THREE.Object3D, parent: THREE.Object3D): void {
    if (isBehaviour(obj)) {
        behaviours.push(obj);
    }

    if (isSpatial(obj)) {
        spatials.push(obj);
    }

    parent.add(obj);
}

export function joinShaders(src: string[]): string {
    return src.join("\n// APPENDED FILE\n")
}