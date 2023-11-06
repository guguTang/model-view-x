import { Material, Mesh, MeshBasicMaterial, Object3D } from 'three';

export type materialCallback = (material: MeshBasicMaterial | Material, node?: Object3D) => boolean;
export type nodeCallback = (node: Object3D | Mesh, materialList: Array<Material>) => boolean;
export class THREEUtils {
    public static TraverseMaterials(object: Object3D, callback: materialCallback) {
        object.traverse((node: Object3D) => {
            const mesh: Mesh = node as Mesh;
            if (!mesh.isMesh) return;
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((it) => callback(it, node));
        });
    }

    public static TraverseNodes(object: Object3D, callback: nodeCallback, onlyMesh: boolean = false) {
        object.traverse((cur: Object3D) => {
            const curMesh: Mesh = cur as Mesh;
            let materials: Array<Material> = [];
            if (curMesh.isMesh) {
                materials = Array.isArray(curMesh.material) ? curMesh.material : [curMesh.material];
            }
            if(onlyMesh === true && curMesh.isMesh || onlyMesh === false) {
                callback(cur, materials);
            }
        });
    }

    public static GetParents(node: Object3D): Array<Object3D> {
        const parents: Array<Object3D> = [];
        if (!node) {
            return parents;
        }
        let curParent = node.parent;
        while (curParent) {
            parents.push(curParent);
            curParent = curParent.parent;
        }
        return parents;
    }

    public static ShowNode(node: Object3D, isShow: boolean, recursive: boolean = true): boolean {
        let needShowParents: Array<Object3D> = [];
        if (isShow === true) {
            needShowParents = this.GetParents(node);
            needShowParents.forEach(it => { it.visible = isShow; });
        }
        if (recursive) {
            node.traverse((curNode: Object3D) => {
                curNode.visible = isShow;
            });
        } else {
            node.visible = isShow;
        }
        return true;
    }
};