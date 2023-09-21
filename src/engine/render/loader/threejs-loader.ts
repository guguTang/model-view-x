import { ModelType, guessModelFileTypeWithFileName } from '@/engine/folder/file';
import { Object3D, LoadingManager, AnimationClip, REVISION, Mesh, MeshPhongMaterial } from 'three';
import { LoaderOpts, LoaderType, SceneLoader } from './loader';
import { LoaderUtils } from 'three';
import DataTransfer from '@/engine/data/transfer';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { Collada, ColladaLoader  } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
const MANAGER: LoadingManager = new LoadingManager();

export abstract class THREELoader extends SceneLoader {
    protected _object?: Object3D;
    protected _clips: Array<AnimationClip> = [];
    protected _loadingManager: LoadingManager;
    private _blobUrls: Array<string> = [];
    constructor(opts: LoaderOpts) {
        super(opts);
        this._loadingManager = MANAGER;//new LoadingManager();
    }

    public Clean(): void {
        this._blobUrls.forEach(URL.revokeObjectURL);
    }

    public async Load(): Promise<boolean> {
        if (this._opts.type === LoaderType.URL && this._opts.url) {
            return this.LoadFromURL(this._opts.url);
        } else if (this._opts.type === LoaderType.Folder) {
            const folderIns = this._opts.folder;
            const urlObj = DataTransfer.ArrayBuffer2Blob(folderIns?.rootFile?.data!);
            const indexUrl = URL.createObjectURL(urlObj);
            const rootPath = folderIns?.rootFolder;
            const baseURL = LoaderUtils.extractUrlBase(indexUrl);
            this._loadingManager.setURLModifier((url: string): string => {
                const normalizedURL = rootPath + decodeURI(url)
                .replace(baseURL, '')
                .replace(/^(\.?\/)/, '');
                const curRes = folderIns?.GetFile(normalizedURL);
                if (curRes) {
                    const blobURL = URL.createObjectURL(DataTransfer.ArrayBuffer2Blob(curRes.data));
                    this._blobUrls.push(blobURL);
                    // console.warn(blobURL);
                    return blobURL;
                }
                return url;
            });
            return this.LoadFromURL(URL.createObjectURL(urlObj));
        }
        return false;
    }

    public get Scene(): any {
        return this._object;
    }
    public get Clips(): any {
        return this._clips;
    }
}

// ===================STL Loader==============================
export class THREESTLLoader extends THREELoader {
    constructor(opts: LoaderOpts) {
        super(opts);
    }

    public async LoadFromURL(url: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const loader = new STLLoader(this._loadingManager);
            loader.load(url, (geometry) => {
                if (!geometry) {
                    reject(new Error('This model contains no scene, and cannot be viewed here. However, it may contain individual 3D resources.'));
                }

                const material = new MeshPhongMaterial({
                    color: 0xcccccc,
                    // specular: 0x494949,
                    // shininess: 200
                });
                const mesh = new Mesh(geometry, material);

                // mesh.position.set( 0, - 0.25, 0.6 );
                // mesh.rotation.set( 0, - Math.PI / 2, 0 );
                mesh.rotation.set(-Math.PI/2, 0, 0);

                // mesh.castShadow = true;
                // mesh.receiveShadow = true;
                this._object = mesh;
                this._clips = [];
                resolve(true);
            }, ()=>{}, (e) => {
                reject(e);
            });
        });
    }
};

// ===================Collada Loader==============================
export class THREEColladaLoader extends THREELoader {
    constructor(opts: LoaderOpts) {
        super(opts);
    }

    public async LoadFromURL(url: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const loader = new ColladaLoader(this._loadingManager);
            loader.load(url, (object: Collada) => {
                if (!object.scene) {
                    reject(new Error('This model contains no scene, and cannot be viewed here. However, it may contain individual 3D resources.'));
                }
                object.scene.traverse((child: Object3D) => {
                    const mesh = child as Mesh;
					if (mesh.isMesh ) {
						// model does not have normals
                        // @ts-ignore
						mesh.material.flatShading = true;
					}

				} );
                this._object = object.scene;
                this._clips = object.scene.animations;
                resolve(true);
            }, ()=>{}, (e) => {
                reject(e);
            });
        });
    }
};

// ===================OBJ Loader==============================
export class THREEOBJLoader extends THREELoader {
    constructor(opts: LoaderOpts) {
        super(opts);
    }

    public async LoadFromURL(url: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const loader = new OBJLoader(this._loadingManager);
            loader.load(url, (object) => {
                if (!object) {
                    reject(new Error('This model contains no scene, and cannot be viewed here. However, it may contain individual 3D resources.'));
                }
                this._object = object;
                this._clips = object.animations;
                resolve(true);
            }, ()=>{}, (e) => {
                reject(e);
            });
        });
    }
};

// ===================FBX Loader==============================
export class THREEFBXLoader extends THREELoader {
    constructor(opts: LoaderOpts) {
        super(opts);
    }

    public async LoadFromURL(url: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const loader = new FBXLoader(this._loadingManager);
            loader.load(url, (object) => {
                if (!object) {
                    // throw new Error('This model contains no scene, and cannot be viewed here. However, it may contain individual 3D resources.');
                    reject(new Error('This model contains no scene, and cannot be viewed here. However, it may contain individual 3D resources.'));
                }
                this._object = object;
                this._clips = object.animations;
                resolve(true);
            }, ()=>{}, (e) => {
                reject(e);
            });
        });
        
        
    }
}

// ===================GLTF Loader==============================
const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`
const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath(`${THREE_PATH}/examples/jsm/libs/draco/gltf/`);
const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath(`${THREE_PATH}/examples/jsm/libs/basis/`);
export class THREEGLTFLoader extends THREELoader {
    constructor(opts: LoaderOpts) {
        super(opts);
    }

    public async LoadFromURL(url: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const loader = new GLTFLoader(this._loadingManager)
            .setCrossOrigin('anonymous')
            .setDRACOLoader(DRACO_LOADER)
            .setKTX2Loader(KTX2_LOADER.detectSupport(this._opts.extra.renderer))
            .setMeshoptDecoder(MeshoptDecoder);
            loader.load(url, (gltfObject) => {
                const gltfScene = gltfObject.scene || gltfObject.scenes[0];
                const clips = gltfObject.animations || [];
                if (!gltfScene) {
                    // throw new Error('This model contains no scene, and cannot be viewed here. However, it may contain individual 3D resources.');
                    reject(new Error('This model contains no scene, and cannot be viewed here. However, it may contain individual 3D resources.'));
                }
                this._object = gltfScene;
                this._clips = clips;
                resolve(true);
            }, () =>{}, e => {
                reject(e);
            });
        });
    }
}



export const factoryCreateLoaderForTHREE = (opts: LoaderOpts): SceneLoader | null => {
    let ins: SceneLoader | null = null;
    let modelType: ModelType = ModelType.NONE;
    if (opts.type === LoaderType.URL && opts.url) {
        const urlIns = new URL(opts.url);
        const pathArray = urlIns.pathname.split('/');
        const entryFileName = pathArray[pathArray.length - 1];
        modelType = guessModelFileTypeWithFileName(entryFileName);
    } else if (opts.type === LoaderType.Folder && opts.folder && opts.folder.Verify() === true) {
        modelType = opts.folder.rootFile?.modelType!;
    }
    try {
        switch(modelType) {
            case ModelType.GLTF:
                ins = new THREEGLTFLoader(opts);
                break;
            case ModelType.FBX:
                ins = new THREEFBXLoader(opts);
                break;
            case ModelType.OBJ:
                ins = new THREEOBJLoader(opts);
                break;
            case ModelType.STL:
                ins = new THREESTLLoader(opts);
                break;
            case ModelType.DAE:
                ins = new THREEColladaLoader(opts);
                break;
        }
    } catch (error: any) {
        console.error(error.toString());
    }
    return ins;
};