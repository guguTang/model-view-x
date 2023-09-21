import { DefaultRenderConfig, RenderConfig } from './config';
import { Render } from './render';
import {
    PerspectiveCamera,
    Scene,
    Color,
    WebGLRenderer,
    PMREMGenerator,
    Texture,
    LoadingManager,
    REVISION,
    AnimationClip,
    Group,
    Box3,
    Vector3,
    Object3D,
    AnimationMixer,
    AmbientLight,
    DirectionalLight,
    Light,
    ToneMapping,
    LinearToneMapping,
    ACESFilmicToneMapping,
    Camera,
    AxesHelper,
    GridHelper,
    BoxHelper,
    Mesh,
    Material,
    MeshBasicMaterial,
    Raycaster,
    Vector2,
    BufferGeometry,
} from 'three';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { INodeSimpleInfo, IVector3, IMaterialInfo, AnimationPlayMode } from './info-struct';
import { factoryCreateLoaderForTHREE } from './loader/threejs-loader';
import { LoaderType, LoaderOpts } from './loader/loader';

const MANAGER: LoadingManager = new LoadingManager();
const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`
const DRACO_LOADER = new DRACOLoader( MANAGER ).setDecoderPath( `${THREE_PATH}/examples/jsm/libs/draco/gltf/` );
const KTX2_LOADER = new KTX2Loader( MANAGER ).setTranscoderPath( `${THREE_PATH}/examples/jsm/libs/basis/` );

export class RenderThreejs extends Render {
    private _defaultCamera: PerspectiveCamera;
    private _activeCamera: PerspectiveCamera;
    private _scene: Scene;
    private _axesScene!: Scene;
    private _axesCamera!: PerspectiveCamera;
    private _content?: Object3D;
    private _renderer: WebGLRenderer;
    private _axesRenderer!: WebGLRenderer;
    private _axesCorner!: AxesHelper;
    private _axesHelper: AxesHelper | null = null;
    private _gridHelper: GridHelper | null = null;
    private _boxHelper: BoxHelper | null = null;
    private _pmremGenerator: PMREMGenerator;
    private _lights: Array<Light> = [];

    private _neutralEnvironment: Texture;
    private _mixer?: AnimationMixer | null;
    private _clips: Array<AnimationClip> = [];
    private _controls: OrbitControls;

    private _prevTime: number = 0;

    private _currentSelectedNodes: Array<Object3D> = [];
    private _selectMaterial: Material;
    private _originNodeMaterialMap: Map<number, Material|Array<Material>> = new Map<number, Material|Array<Material>>();
    constructor (el: HTMLElement, axesel: HTMLElement, opts: RenderConfig = DefaultRenderConfig) {
        super(el, axesel, opts);
        // init scene
        this._scene = new Scene();
        this.SetBackgroundColor(this._config.backgroundColor);

        // init camera
        const fov = false ? 0.8 * 180 / Math.PI : 60;
        this._defaultCamera = new PerspectiveCamera(fov, this._el.clientWidth / this._el.clientHeight, 0.01, 1000);
        this._activeCamera = this._defaultCamera;
        this._scene.add(this._defaultCamera);

        // init renderer
        this._renderer = new WebGLRenderer({ antialias: true });
        this._renderer.useLegacyLights = false;
        this._renderer.setClearColor(0xcccccc);
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(this._el.clientWidth, this._el.clientHeight);

        //
        this._pmremGenerator = new PMREMGenerator(this._renderer);
        this._pmremGenerator.compileEquirectangularShader();

        this._neutralEnvironment = this._pmremGenerator.fromScene(new RoomEnvironment()).texture;

        this._controls = new OrbitControls(this._defaultCamera, this._renderer.domElement);
        this._controls.screenSpacePanning = true;

        this._el.appendChild(this._renderer.domElement);
        this.addAxesHelper();
        // this.cameraCtrl = null;
        // this.cameraFolder = null;
        // this.animFolder = null;
        // this.animCtrls = [];
        // this.morphFolder = null;
        // this.morphCtrls = [];
        // this.skeletonHelpers = [];
        // this.gridHelper = null;
        // this.axesHelper = null;

        // this.addAxesHelper();
        // this.addGUI();
        // if (options.kiosk) this.gui.close();

        // this.animate = this.animate.bind(this);
        // requestAnimationFrame( this.animate );
        this.animate = this.animate.bind(this);
        window.addEventListener('resize', this.Resize.bind(this), false);

        // const resizeObserver = new ResizeObserver(() => {
        //     const { clientHeight, clientWidth } = this._el;
        //     this._defaultCamera.aspect = clientWidth / clientHeight;
        //     this._defaultCamera.updateProjectionMatrix();
        //     this._renderer.setSize(clientWidth, clientHeight);
        // });
        // resizeObserver.observe(this._el);

        this._selectMaterial = new MeshBasicMaterial({ color: 0x0F52BA });

        this.addSingleClickListener(); // Raycaster
    }

    private addSingleClickListener() {
        const raycaster = new Raycaster();
        const mouse = new Vector2();
        const camera = this._activeCamera;
        const container = this._el;
        const onClickPosition = new Vector2();
        function getMousePosition(dom: HTMLElement, x: number, y: number) {
            const rect = dom.getBoundingClientRect();
            return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];

        }
        function getIntersects(point: any, objects: any) {
            mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);
            raycaster.setFromCamera(mouse, camera);
            return raycaster.intersectObjects(objects, true);
        }

        /* container.addEventListener('mousemove', (ev) => {
            ev.preventDefault();
            const array = getMousePosition(container, ev.clientX, ev.clientY);
			onClickPosition.fromArray(array);
			const intersects = getIntersects(onClickPosition, this._content?.children);
			if ( intersects.length > 0) {
			}
        }); */

        let startPointX: number;
        let startPointY: number;
        container.addEventListener('mousedown', (ev) => {
            if (ev.button === 0) { // left button
                startPointX = ev.clientX;
                startPointY = ev.clientY;
            }
        });

        container.addEventListener('mouseup', (event: MouseEvent) => {
            event.preventDefault();
            /* if (event.clientX !== startPointX || event.clientY !== startPointY) {
                return;
            } */
            if (event.button === 0) { // left button
                if (Math.abs(startPointX - event.clientX) > 2 && Math.abs(startPointY - event.clientY) > 2 ) {
                    return;
                }
                // if (event.ctrlKey === false) {
                //     return;
                // }
                let objectID = null;
                if (this._content) {
                    const array = getMousePosition(container, event.clientX, event.clientY);
                    onClickPosition.fromArray(array);
                    const intersects = getIntersects(onClickPosition, this._content?.children);
                    if (intersects.length > 0) {
                        // console.log(onClickPosition, intersects[0].object.name);
                        objectID = intersects[0].object.id;
                    }
                }
                if (typeof this._singleClickCallback === 'function') {
                    this._singleClickCallback(objectID);
                }
            }
        });
    }

    private addLights() {
        const light1  = new AmbientLight(this._config.ambientColor, this._config.ambientIntensity);
        light1.name = 'ambient_light';
        this._defaultCamera.add(light1);

        const light2  = new DirectionalLight(this._config.directColor, this._config.directIntensity);
        light2.position.set(0.5, 0, 0.866); // ~60º
        light2.name = 'main_light';
        this._defaultCamera.add( light2 );

        this._lights.push(light1, light2);
    }

    private removeLights() {
        this._lights.forEach((light) => light.parent?.remove(light));
        this._lights = [];
    }

    private updateLights() {
        if (this._config.punctualLights && !this._lights.length) {
            this.addLights();
        } else if (!this._config.punctualLights && this._lights.length) {
            this.removeLights();
        }

        this._renderer.toneMapping = this._config.toneMapping as ToneMapping;
        this._renderer.toneMappingExposure = Math.pow(2, this._config.exposure);

        if (this._lights.length === 2) {
            this._lights[0].intensity = this._config.ambientIntensity;
            this._lights[0].color.set(this._config.ambientColor);
            this._lights[1].intensity = this._config.directIntensity;
            this._lights[1].color.set(this._config.directColor);
        }
    }

    private updateDisplay() {
        if (this._state.grid !== Boolean(this._gridHelper)) {
            if (this._state.grid) {
              this._gridHelper = new GridHelper();
              this._axesHelper = new AxesHelper();
              this._axesHelper.renderOrder = 999;
              this._axesHelper.onBeforeRender = (renderer) => renderer.clearDepth();
              this._scene.add(this._gridHelper);
              this._scene.add(this._axesHelper);
            } else if (this._gridHelper != null && this._axesHelper != null) {
              this._scene.remove(this._gridHelper);
              this._scene.remove(this._axesHelper);
              this._gridHelper = null;
              this._axesHelper = null;
              this._axesRenderer.clear();
            }
          }
    }

    private addAxesHelper() {
        const {clientWidth, clientHeight} = this._axesEl;
        this._axesScene = new Scene();
        this._axesCamera = new PerspectiveCamera( 50, clientWidth / clientHeight, 0.1, 10 );
        this._axesScene.add(this._axesCamera);

        this._axesRenderer = new WebGLRenderer({ alpha: true });
        this._axesRenderer.setPixelRatio(window.devicePixelRatio);
        this._axesRenderer.setSize(this._axesEl.clientWidth, this._axesEl.clientHeight);

        this._axesCamera.up = this._defaultCamera.up;

        this._axesCorner = new AxesHelper(5);
        this._axesScene.add(this._axesCorner);
        this._axesEl.appendChild(this._axesRenderer.domElement);
    }

    private animate(time: number) {
        requestAnimationFrame(this.animate);
        const dt = (time - this._prevTime) / 1000;
        this._controls.update();
        this._mixer?.update(dt);
        this.render();

        this._prevTime = time;
    }

    public Resize() {
        const { clientHeight, clientWidth } = this._el;
        this._defaultCamera.aspect = clientWidth / clientHeight;
        this._defaultCamera.updateProjectionMatrix();
        this._renderer.setSize(clientWidth, clientHeight);

        this._axesCamera.aspect = this._axesEl.clientWidth / this._axesEl.clientHeight;
        this._axesCamera.updateProjectionMatrix();
        this._axesRenderer.setSize(this._axesEl.clientWidth, this._axesEl.clientHeight);
    }

    private render() {
        this._renderer.render(this._scene, this._activeCamera);
        if (this._state.minAxes) {
            this._axesCamera.position.copy(this._defaultCamera.position)
            this._axesCamera.lookAt(this._axesScene.position)
            this._axesRenderer.render(this._axesScene, this._axesCamera);
        }
    }

    private setContent(object: Group, clips: Array<AnimationClip>) {
        this.Clear();
        object.updateMatrixWorld();

        const box = new Box3().setFromObject(object);
        const size = box.getSize(new Vector3()).length();
        const center = box.getCenter(new Vector3());

        this._controls.reset();

        object.position.x += (object.position.x - center.x);
        object.position.y += (object.position.y - center.y);
        object.position.z += (object.position.z - center.z);

        this._controls.maxDistance = size * 10;
        this._defaultCamera.near = size / 100;
        this._defaultCamera.far = size * 100;
        this._defaultCamera.updateProjectionMatrix();
        
        this._defaultCamera.position.copy(center);
        this._defaultCamera.position.x += size / 2.0;
        this._defaultCamera.position.y += size / 5.0;
        this._defaultCamera.position.z += size / 2.0;
        this._defaultCamera.lookAt(center);

        this._axesCamera.position.copy(this._defaultCamera.position);
        this._axesCamera.lookAt(this._axesScene.position);
        this._axesCamera.near = size / 100;
        this._axesCamera.far = size * 100;
        this._axesCamera.updateProjectionMatrix();
        this._axesCorner.scale.set(size, size, size);

        this._controls.saveState();
        
        this._scene.add(object);
        this._content = object;

        // @ts-ignore
        window.globalobj = object;

        this._content.traverse((node: any) => {
            if (node.isLight) {
              this._config.punctualLights = false;
            } else if (node.isMesh) {
              // TODO(https://github.com/mrdoob/three.js/pull/18235): Clean up.
            //   node.material.depthWrite = !node.material.transparent;
            }
        });

        this.setClips(clips);
        this.setNodeTree();
        this.setOriginInfo();
        this.SetDoubleSide(this._state.doubleSide, true);

        this.updateLights();
        this.updateDisplay();
    }

    private setOriginInfo() {
        this._originNodeMaterialMap = new Map<number, Material|Array<Material>>();
        if (this._content) {
            this._content.traverse(it => {
                const mesh = it as Mesh;
                if (mesh.isMesh) {
                    this._originNodeMaterialMap.set(mesh.id, mesh.material);
                }
            });
        }
    }

    private setNodeTree() {
        const buildNodeInfo = (node: Object3D) => {
            const mesh = node as Mesh;
            const geometry = mesh.geometry as BufferGeometry;
            const box = new Box3().setFromObject(node);
            let triangles = 0;
            let vertices = 0;
            if (geometry) {
                vertices += geometry.attributes.position.count;
                if (geometry.index) {
                    triangles += geometry.index.count / 3;
                } else {
                    triangles += geometry.attributes.position.count / 3;
                }
            }
            const curNodeSimpleInfo: INodeSimpleInfo = {
                id: mesh.id,
                name: mesh.name || '',
                isMesh: mesh?.isMesh || false,
                isGroup: (node as Group).isGroup || false,
                children: [],
                triangles,
                vertices,
                boundingBox: new Vector3(),
                min: box.min.clone(),
                max: box.max.clone(),
            };
            box.getSize(curNodeSimpleInfo.boundingBox);
            // const size = box.getSize(new Vector3()).length();
            // const center = box.getCenter(new Vector3());
            // console.error(size, center);
            return curNodeSimpleInfo;
        };

        const traverseNode = (node: Object3D): Array<INodeSimpleInfo> => {
            return node.children.map(it => {
                const curNodeSimpleInfo = buildNodeInfo(it);
                curNodeSimpleInfo.children = traverseNode(it);
                return curNodeSimpleInfo;
            });
        };

        let nodeTree: Array<INodeSimpleInfo> = [];
        if (this._content && this._content.children.length > 0) {
            const rootNode: INodeSimpleInfo = buildNodeInfo(this._content);
            nodeTree.push(rootNode);
            rootNode.children = traverseNode(this._content);
        }
        this.setNodeTreeRedundancy(nodeTree);
        // console.error(this._nodeTree);
    }

    private setClips(clips: Array<AnimationClip>) {
        if (this._mixer) {
            this._mixer.stopAllAction();
            this._mixer.uncacheRoot(this._mixer.getRoot());
            this._mixer = null;
          }
      
          this._clips = clips;
          if (!clips.length) return;
          if (!this._content) return;
          this._mixer = new AnimationMixer(this._content);
    }

    // 取消选中所有节点
    private unselectAllNode() {
        this._currentSelectedNodes.forEach(it => {
            it.traverse(it => {
                const mesh = it as Mesh;
                if (mesh.isMesh) {
                    const originMaterial = this._originNodeMaterialMap.get(it.id);
                    if (originMaterial) {
                        mesh.material = originMaterial;
                    }
                }
            });
        });
        this._currentSelectedNodes = [];
        this._selectedNodeInfo = [];
    }

    // 选中node
    private selectNode(node: Object3D): boolean {
        console.warn('select node', node);
        this._currentSelectedNodes.push(node);
        this._selectedNodeInfo.push(this._nodeTreeMap.get(node.id)!);
        node.traverse(it => {
            const mesh = it as Mesh;
            if (mesh.isMesh) {
                mesh.material = this._selectMaterial;
            }
        });
        return true;
    }

    public Start(): boolean {
        requestAnimationFrame(this.animate);
        return true;
    }

    public SetBackgroundColor(val: string): void {
        this._config.backgroundColor = val;
        this._scene.background = new Color(val);
    }

    public GetBackgroundColor(): string {
        return this._config.backgroundColor;
    }

    public SetDoubleSide(mark: boolean, force?: boolean): void {
        if(!this._content) {
            return;
        }
        if (mark === this._state.doubleSide && force !== true) {
            return;
        }
        traverseMaterials(this._content, (material: Material) => {
            material.side = mark ? THREE.DoubleSide : THREE.FrontSide;
        });
        this._state.doubleSide = mark;
    }

    public IsDoubleSide(): boolean {
        return this._state.doubleSide;
    }

    public HasContent(): boolean {
        return this._content ? true : false;
    }

    public GetAnimationNames(): Array<string> {
        return this._clips.map(it => it.name);
    }

    public PlayAnimationWithName(name: string, isPlay: boolean = true, type: AnimationPlayMode = 'once'): void {
        const clip = this._clips.find(it => it.name === name);
        if (clip) {
            let loopType: THREE.AnimationActionLoopStyles = THREE.LoopOnce;
            switch (type) {
                case 'once': loopType = THREE.LoopOnce; break;
                case 'repeat': loopType = THREE.LoopRepeat; break;
                case 'pingpong': loopType = THREE.LoopPingPong; break;
                case 'reverse':  loopType = THREE.LoopOnce; break;
                default: break;
            }
            const action = this._mixer?.clipAction(clip);
            if (action) {
                if (isPlay) {
                    action.reset().setLoop(loopType, 1).play();
                } else {
                    action.reset().stop();
                }
            }
        }
    }


    public GetMaterialInfo(nodeID: number): IMaterialInfo | null {
        const node = this._content?.getObjectById(nodeID);
        if (node) {
            const mesh = node as Mesh;
            THREE.MeshPhysicalMaterial
            if (mesh.isMesh) {
                console.warn(mesh.material as THREE.MeshPhysicalMaterial);
                // console.warn((mesh.material as THREE.MeshPhysicalMaterial));
            }
        }
        return null;
    }

    // 显示小的坐标轴辅助
    public ShowMinAxes(mark: boolean): void {
        this._state.minAxes = mark;
        if (mark === false) {
            this._axesRenderer.clear();
        }
    }

    // 自动旋转
    public AutoRotate(mark: boolean) {
        this._state.autoRotate = mark;
        this._controls.autoRotate = mark; 
    }

    // 根据node id显示node
    public ShowNodeWithID(nodeID: number, isShow: boolean = true, recursive: boolean = true): boolean {
        const node = this._content?.getObjectById(nodeID);
        if (!node) {
            return false;
        }
        if (recursive === false) {
            node.visible = isShow;
        } else {
            node.traverse((node: Object3D) => {
                node.visible = isShow;
            });
        }
        return true;
    }

    // 选中node变色
    public SelectNodeWithID(nodeID: number | null): boolean {
        this.unselectAllNode();
        if (nodeID === null) {
            return false;
        }
        const node = this._content?.getObjectById(nodeID);
        if (!node) {
            return false;
        }
        return this.selectNode(node);
    }

    // public GetNodeGeom

    public async Load(opts: LoaderOpts): Promise<boolean> {
        opts.extra = {
            renderer: this._renderer,
        };
        const loaderIns = factoryCreateLoaderForTHREE(opts);
        if (loaderIns === null) {
            return Promise.reject('create loader failed');
        } else {
            const rv = await loaderIns.Load();
            if (rv === true) {
                this.setContent(loaderIns.Scene, loaderIns.Clips);
            }
            
            return rv;
        }
    }

    public async LoadFromUrl(url: string): Promise<boolean> {
        const loaderIns = factoryCreateLoaderForTHREE({
            type: LoaderType.URL,
            url: url,
            extra: {
                renderer: this._renderer,
            }
        });
        if (loaderIns === null) {
            return Promise.reject('create loader failed');
        } else {
            const rv = await loaderIns.Load();
            if (rv === true) {
                this.setContent(loaderIns.Scene, loaderIns.Clips);
            }
            loaderIns.Clean();
            return rv;
        }
        /*
        return new Promise<boolean>((resolve, reject) => {
            const loader = new GLTFLoader(MANAGER)
            .setCrossOrigin('anonymous')
            .setDRACOLoader(DRACO_LOADER )
            .setKTX2Loader(KTX2_LOADER.detectSupport(this._renderer))
            .setMeshoptDecoder(MeshoptDecoder);
            loader.load(url, (gltfObject) => {
                const gltfScene = gltfObject.scene || gltfObject.scenes[0];
                const clips = gltfObject.animations || [];
                if (!gltfScene) {
                    // throw new Error('This model contains no scene, and cannot be viewed here. However, it may contain individual 3D resources.');
                    reject(new Error('This model contains no scene, and cannot be viewed here. However, it may contain individual 3D resources.'));
                }
                this.setContent(gltfScene, clips);
                resolve(true);
            }, () =>{}, e => {
                reject(e);
            });
        });*/
    }

    public Clear() {
        if (!this._content) return;
        if (this._content) {
            this._scene.remove(this._content);
            // dispose geometry
            this._content.traverse((node: any) => {
                if (!node.isMesh) return;
                node.geometry.dispose();
            } );

            // dispose textures
            traverseMaterials(this._content, (material: any) => {
                for ( const key in material ) {
                    if ( key !== 'envMap' && material[key] && material[key].isTexture ) {
                        material[key].dispose();
                    }
                }
            });
        }
    }

    public PlayAllClips () {
        this._clips.forEach((clip) => {
          this._mixer?.clipAction(clip).reset().play();
        //   this.state.actionStates[clip.name] = true;
        });
    }

    public PlayAllAnimation(): void {
        this.PlayAllClips();
    }

    public ShowWireframe(mark: boolean): void {
        if (this._content) {
            this._state.wireframe = mark;
            traverseMaterials(this._content, (material: any) => {
                material.wireframe = mark;
            });
        }
    }

    public ShowBoundingBox(mark: boolean): void {
        if (this._boxHelper) {
            this._scene.remove(this._boxHelper);
            this._boxHelper = null;
        }
        if (mark === true && this._content) {
            this._boxHelper = new BoxHelper(this._content, 0xffffff);
            this._scene.add(this._boxHelper);
        }
    }
}

function traverseMaterials (object: Object3D, callback: any) {
    object.traverse((node: any) => {
      if (!node.isMesh) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach(callback);
    });
}

/* function traverseNodes (object: Object3D, callback: any) {
    object.traverse((node: Object3D) => {

    })
} */