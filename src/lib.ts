import * as THREE from "three";

export const debugMode = true;
export const behaviours: Behaviour[] = []

export interface Behaviour extends THREE.Object3D {
    update(delta: number): void,
}

function isBehaviour(obj: THREE.Object3D): obj is Behaviour {
    return (obj as Behaviour).update !== undefined;
}

export function instantiate(obj: THREE.Object3D, parent: THREE.Object3D): void {
    if (isBehaviour(obj)) {
        behaviours.push(obj);
    }

    parent.add(obj);
}

export function joinShaders(src: string[]): string {
    return src.join("\n// APPENDED FILE\n")
}