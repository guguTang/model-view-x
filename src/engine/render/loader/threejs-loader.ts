import { ModelType, guessModelFileTypeWithFileName } from '@/engine/folder/file';
import { Object3D, LoadingManager, AnimationClip, REVISION, Mesh, MeshPhongMaterial } from 'three';
import { LoaderOpts, LoaderType, SceneLoader } from './loader';
import { LoaderUtils } from 'three';
import DataTransfer from '@/engine/data/transfer';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { IFCLoader } from './threejs-ifc/IFCLoader';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OBJLoader } from './threejs-obj-loader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { Collada, ColladaLoader  } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { ImporterOBJ } from '../../import/index';
import { IFCModel } from './threejs-ifc/IFC/components/IFCModel';
// import { IFCSPACE } from 'web-ifc';
const MANAGER: LoadingManager = new LoadingManager();

export abstract class THREELoader extends SceneLoader {
    protected _object?: Object3D;
    protected _clips: Array<AnimationClip> = [];
    protected _loadingManager: LoadingManager;
    protected _blobUrls: Array<string> = [];
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
            return this.LoadFromLocal();
        }
        return false;
    }

    public async LoadFromLocal() {
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
        let baseURL: string = '';
        if(url.indexOf('blob:') !== 0) {
            baseURL = LoaderUtils.extractUrlBase(url);
        }
        return new Promise<boolean>(async (resolve, reject) => {
            const objLoader = new OBJLoader(this._loadingManager);
            // get index obj file content
            const objContent = await fetch(url).then(res => res.arrayBuffer()).catch(e => {
                reject(e);
            });
            if (!objContent) {
                return;
            }
            // get mtl libs
            const importer = new ImporterOBJ();
            importer.Import('obj', 'obj', objContent);
            
            const mtlLibsName = importer.mtlLibsName;
            let materialArray = [];
            if(mtlLibsName.length > 0) {
                const mtlLoader = new MTLLoader(this._loadingManager);
                if (baseURL) {
                    mtlLoader.setPath(baseURL);
                }
                const promiseArray = importer.mtlLibsName.map(it => {
                    return new Promise<MTLLoader.MaterialCreator>((resolve, reject) => {
                        mtlLoader.load(it, (materials) => {
                            resolve(materials);
                        }, () => {}, (e) => {
                            reject(e);
                        });
                    });
                });
                materialArray = await Promise.all(promiseArray);
                materialArray.forEach(it => objLoader.setMaterials(it));
            }
            objLoader.load(url, (object: any) => {
                if (!object) {
                    reject(new Error('This model contains no scene, and cannot be viewed here. However, it may contain individual 3D resources.'));
                }
                this._object = object;
                this._clips = object.animations;
                resolve(true);
            }, ()=>{}, (e: any) => {
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
// const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`
// import gltf_draco_wasm_wrapper_js from '@/vendor/threejs/157/libs/draco/gltf/draco_wasm_wrapper.js?raw';
// import gltf_draco_decoder_wasm from '@/vendor/threejs/157/libs/draco/gltf/draco_decoder.wasm?raw';
// import basis_transcoder_js from '@/vendor/threejs/157/libs/basis/basis_transcoder.js?raw';
// import basis_transcoder_wasm from '@/vendor/threejs/157/libs/basis/basis_transcoder.wasm?raw';
// import Folder from '../../folder/folder';

// console.error(DataTransfer.AsciiString2ArrayBuffer(gltf_draco_decoder_wasm), gltf_draco_decoder_wasm.length);
// fetch(URL.createObjectURL(DataTransfer.String2Blob(gltf_draco_decoder_wasm))).then(res=>res.arrayBuffer()).then(res=>console.error(res));
// console.error(gltf_draco_decoder_wasm);
// const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath(`${THREE_PATH}/examples/jsm/libs/draco/gltf/`);
// const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath(`${THREE_PATH}/examples/jsm/libs/basis/`);
/*
class StaticResFolder extends Folder {
    constructor() {
        super();
        this._rootFolder = '';
    }

    public Init(): Promise<boolean> {
        this.AddFile('/draco/gltf/draco_wasm_wrapper.js', {
            path: '/draco/gltf/draco_wasm_wrapper.js',
            name: 'draco_wasm_wrapper.js',
            data: DataTransfer.Utf8String2ArrayBuffer(gltf_draco_wasm_wrapper_js),
            size: 0,
            type: 'javascript',
            modelType: ModelType.NONE,
        });
        this.AddFile('/draco/gltf/draco_decoder.wasm', {
            path: '/draco/gltf/draco_decoder.wasm',
            name: 'draco_decoder.wasm',
            data: DataTransfer.Utf8String2ArrayBuffer(gltf_draco_decoder_wasm),
            size: 0,
            type: 'wasm',
            modelType: ModelType.NONE,
        });
        this.AddFile('/basis/basis_transcoder.js', {
            path: '/basis/basis_transcoder.js',
            name: 'basis_transcoder.js',
            data: DataTransfer.Utf8String2ArrayBuffer(basis_transcoder_js),
            size: 0,
            type: 'javascript',
            modelType: ModelType.NONE,
        });
        this.AddFile('/basis/basis_transcoder.wasm', {
            path: '/basis/basis_transcoder.wasm',
            name: 'basis_transcoder.wasm',
            data: DataTransfer.Utf8String2ArrayBuffer(basis_transcoder_wasm),
            size: 0,
            type: 'wasm',
            modelType: ModelType.NONE,
        });
        return Promise.resolve(true);
    }

    protected SetRootFile(): void {

    }
}
*/
// const staticFolder = new StaticResFolder();
// await staticFolder.Init();

const THREE_PATH = `vendor/threejs/${REVISION}/libs`;
export class THREEGLTFLoader extends THREELoader {
    private _dracoLoader: DRACOLoader;
    private _ktx2Loader: KTX2Loader;
    private _gltfLoader: GLTFLoader;
    private _staticLoaderManager: LoadingManager;
    constructor(opts: LoaderOpts) {
        super(opts);
        this._staticLoaderManager = new LoadingManager();
        this._dracoLoader = new DRACOLoader(this._staticLoaderManager).setDecoderPath(`${THREE_PATH}/draco/gltf/`);
        this._ktx2Loader = new KTX2Loader(this._staticLoaderManager).setTranscoderPath(`${THREE_PATH}/basis/`);
        this._gltfLoader = new GLTFLoader(this._loadingManager);
        this.modifyStaticResLoaderManager();
    }


    private modifyStaticResLoaderManager() {
        this._staticLoaderManager.setURLModifier((url: string): string => {
            // console.error(url);
            // if(url.indexOf('blob:') === 0) {
            //     const filename = `output.ktx`;
            //     const link = document.createElement('a');
            //     link.style.display = 'none';
            //     document.body.appendChild(link);
            //     link.href = url;
            //     link.download = filename;
            //     link.click();
            //     document.body.removeChild(link);
            // }
           
            return url;
        });
        // const backup = `https://unpkg.com/three@0.${REVISION}.x/examples/jsm/libs`;
        // this._staticLoaderManager.setURLModifier((url: string): string => {

        //     if (REVISION === '157') {
        //         const fileInfo = staticFolder.GetFile(url);
        //         if (fileInfo) {
        //             const blobURL = URL.createObjectURL(DataTransfer.ArrayBuffer2Blob(fileInfo.data));
        //             this._blobUrls.push(blobURL);
        //             return blobURL;
        //         }
                
        //     }
      
        //     return `${backup}${url}`;
        // });
    }
    

    public Clean(): void {
        super.Clean();
        this._ktx2Loader.dispose();
        this._dracoLoader.dispose();
    }

    public async LoadFromURL(url: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._gltfLoader
            .setCrossOrigin('anonymous')
            .setDRACOLoader(this._dracoLoader)
            .setKTX2Loader(this._ktx2Loader.detectSupport(this._opts.extra.renderer))
            .setMeshoptDecoder(MeshoptDecoder);
            this._gltfLoader.load(url, (gltfObject) => {
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

// ===================IFC Loader==============================
import {acceleratedRaycast, computeBoundsTree, disposeBoundsTree} from 'three-mesh-bvh';
export class THREEIFCLoader extends THREELoader {
    private _ifcLoader: IFCLoader;
    constructor(opts: LoaderOpts) {
        super(opts);
        this._ifcLoader = new IFCLoader(this._loadingManager);
        this.setupThreeMeshBVH();
    }

    public Clean(): void {
        super.Clean();
        // this._ifcLoader.ifcManager.dispose();
    }

    private setupThreeMeshBVH() {
        this._ifcLoader.ifcManager.setupThreeMeshBVH(
            computeBoundsTree,
            disposeBoundsTree,
            acceleratedRaycast
        );
    }

    public async LoadFromURL(url: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            await this._ifcLoader.ifcManager.setWasmPath('vendor/web-ifc/0.0.44/');
            // await loader.ifcManager.parser.setupOptionalCategories( {
            //     [ IFCSPACE ]: false,
            // });
            await this._ifcLoader.ifcManager.applyWebIfcConfig( {
                USE_FAST_BOOLS: true
            });
            this._ifcLoader.load(url, (model: IFCModel) => {
                if (!model) {
                    // throw new Error('This model contains no scene, and cannot be viewed here. However, it may contain individual 3D resources.');
                    reject(new Error('This model contains no scene, and cannot be viewed here. However, it may contain individual 3D resources.'));
                }
                this._object = model;
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
            case ModelType.GLTF: {
                ins = new THREEGLTFLoader(opts);
                break;
            }
            case ModelType.FBX: {
                ins = new THREEFBXLoader(opts);
                break;
            }
            case ModelType.OBJ: {
                ins = new THREEOBJLoader(opts);
                break;
            }
            case ModelType.STL: {
                ins = new THREESTLLoader(opts);
                break;
            }
            case ModelType.DAE: {
                ins = new THREEColladaLoader(opts);
                break;
            }
            case ModelType.IFC: {
                ins = new THREEIFCLoader(opts);
                break;
            }
        }
    } catch (error: any) {
        console.error(error.toString());
    }
    return ins;
};