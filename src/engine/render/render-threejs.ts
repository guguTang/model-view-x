import { DefaultRenderConfig, RenderConfig } from './config';
import { Render } from './render';
import {
    PerspectiveCamera,
    Scene,
    Color,
    WebGLRenderer,
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
    // LinearToneMapping,
    // ACESFilmicToneMapping,
    // Camera,
    AxesHelper,
    GridHelper,
    Mesh,
    Material,
    Raycaster,
    Vector2,
    BufferGeometry,
} from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { INodeSimpleInfo, AnimationPlayMode, LightEnum, ILight, EnvironmentType } from './info-struct';
import { factoryCreateLoaderForTHREE } from './loader/threejs-loader';
import { LoaderType, LoaderOpts } from './loader/loader';
import { THREEHelper } from './threejs/helper';
import { MaterialBase } from '../model/material/index';
import * as TX from '@/engine/index';
import THREEEffect from './threejs/effect';
import { THREEUtils } from './threejs/utils';
import { ModelType } from '../folder/file';
import { THREEExporterBase, THREEExporterGLTF, THREEExporterSTL } from './threejs/export';
import { ExportOption } from '../export/index';
import { THREEViewHelper } from './threejs/view-helper';
import { THREEAxesHelper } from './threejs/axes-helper';
// import a from '@/assets/images/footprint_court_2k.exr?raw';
// console.log(a);

export class RenderThreejs extends Render {
    private _defaultCamera: PerspectiveCamera;
    private _activeCamera: PerspectiveCamera;
    private _scene: Scene;
    private _content?: Object3D;
    private _renderer: WebGLRenderer;
    private _axesHelper: AxesHelper | null = null;
    private _viewHelper: THREEViewHelper | null = null;
    private _axesCornerHelper: THREEAxesHelper | null = null;
    private _gridHelper: GridHelper | null = null;
    private _lights: Map<LightEnum, Light> = new Map<LightEnum, Light>();

    private _mixer?: AnimationMixer | null;
    private _clips: Array<AnimationClip> = [];
    private _controls: OrbitControls;

    private _helper: THREEHelper;
    private _effectManager: THREEEffect;

    private _prevTime: number = 0;
    private _currentSelectedNodes: Array<Object3D> = [];
    // private _selectMaterial: Material;
    private _originNodeMaterialMap: Map<number, Array<Material>> = new Map<number, Array<Material>>();
    constructor (el: HTMLElement, axesel: HTMLElement, opts: RenderConfig = DefaultRenderConfig) {
        super(el, axesel, opts);
        // init scene
        this._scene = new Scene();
        this.SetBackgroundColor(this._state.backgroundColor);

        // init camera
        const fov = false ? 0.8 * 180 / Math.PI : 60;
        this._defaultCamera = new PerspectiveCamera(fov, this._el.clientWidth / this._el.clientHeight, 0.01, 1000);
        this._activeCamera = this._defaultCamera;
        this._scene.add(this._defaultCamera);

        // init renderer
        this._renderer = new WebGLRenderer({ antialias: true });
        this._renderer.autoClear = false;
        this._renderer.useLegacyLights = false;
        this._renderer.setClearColor(0xcccccc);
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(this._el.clientWidth, this._el.clientHeight);
        this._canvas = this._renderer.domElement;

        this._helper = new THREEHelper(this._renderer);
        this._effectManager = new THREEEffect(this._el, this._renderer, this._scene, this._activeCamera);

        this._controls = new OrbitControls(this._defaultCamera, this._renderer.domElement);
        this._controls.screenSpacePanning = true;

        this._viewHelper = new THREEViewHelper(this._activeCamera, axesel, this._renderer);

        // this._axesCornerHelper = new THREEAxesHelper(axesel, this._activeCamera);

        this._el.appendChild(this._renderer.domElement);
        // this.addAxesHelper();
        // this.cameraCtrl = null;
        // this.cameraFolder = null;
        // this.animFolder = null;
        // this.animCtrls = [];
        // this.morphFolder = null;
        // this.morphCtrls = [];
        // this.skeletonHelpers = [];

        this._animateCallback = this.animateCallback;
        window.addEventListener('resize', this.OnResize.bind(this), false);
        // this._el.onresize = this.OnResize.bind(this);

        // const resizeObserver = new ResizeObserver((entries) => {
        //     const clientWidth = entries[0].contentRect.width;
        //     const clientHeight = entries[0].contentRect.height;
        //     this._defaultCamera.aspect = clientWidth / clientHeight;
        //     this._defaultCamera.updateProjectionMatrix();
        //     this._renderer.setSize(clientWidth, clientHeight);

        //     this._axesCamera.aspect = this._axesEl.clientWidth / this._axesEl.clientHeight;
        //     this._axesCamera.updateProjectionMatrix();
        //     this._axesRenderer.setSize(this._axesEl.clientWidth, this._axesEl.clientHeight);

        //     this._effectManager.OnResize(clientWidth, clientHeight);
        // });
        // resizeObserver.observe(this._el);
        // this._selectMaterial = new MeshBasicMaterial({ color: 0x0F52BA });
        this.addSingleClickListener(); // Raycaster
    }

    private animateCallback(time: number): boolean {
        const dt = (time - this._prevTime) / 1000;
        this.OnUpdate(dt);
        this._prevTime = time;
        return true;
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
        // 环境光
        const ambientLight  = new AmbientLight(this._state.lights.ambient.color, this._state.lights.ambient.intensity);
        ambientLight.name = 'ambient_light';
        this._defaultCamera.add(ambientLight);
        
        // 方向光 主光源
        const directLight  = new DirectionalLight(this._state.lights.direct.color, this._state.lights.direct.intensity);
        directLight.position.set(0.5, 0, 0.866); // ~60º
        directLight.name = 'main_light';
        this._defaultCamera.add(directLight);

        this._lights.set('ambient', ambientLight);
        this._lights.set('direct', directLight);
    }

    private removeLights() {
        this._lights.forEach((light) => light.parent?.remove(light));
        this._lights.clear();
    }

    private updateLights() {
        if (this._config.punctualLights && !this._lights.size) {
            this.addLights();
        } else if (!this._config.punctualLights && this._lights.size) {
            this.removeLights();
        }

        this._renderer.toneMapping = this._config.toneMapping as ToneMapping;
        this._renderer.toneMappingExposure = Math.pow(2, this._config.exposure);

        if (this._lights.size > 0) {
            this.updateLight('ambient');
            this.updateLight('direct');
        }
    }

    private updateLight(lightType: LightEnum) {
        const light = this._lights.get(lightType);
        let lightState: ILight | null = null;
        switch (lightType) {
            case 'ambient': {
                lightState = this._state.lights.ambient;
                break;
            }  
            case 'direct': {
                lightState = this._state.lights.direct;
                break;
            }
            default:
                break;
        }
        if (lightState && light) {
            light.intensity = this._state.lights.direct.intensity;
            light.color.set(this._state.lights.direct.color);
        }
    }

    private removeGrid() {
        if (this._gridHelper) {
            this._scene.remove(this._gridHelper);
            this._gridHelper = null;
            if (this._state.gridWithAxes && this._axesHelper) {
                this._scene.remove(this._axesHelper);
                this._axesHelper = null;
            }
        }
    }

    private updateGrid(size: number, force: boolean = false) {
        if (this._state.grid) {
            if (this._gridHelper === null || force === true) {
                this.removeGrid();
                let divisions = 10;
                let finalSize = 10;
                if (!size && this._content) {
                    const box = new Box3().setFromObject(this._content);
                    finalSize = box.getSize(new Vector3()).length();
                } else {
                    finalSize = size;
                }
                // divisions = Math.floor(finalSize / 10);
                this._gridHelper = new GridHelper(finalSize, divisions);
                this._gridHelper.material.depthWrite = false;
                this._scene.add(this._gridHelper);

                if (this._state.gridWithAxes) {
                    this._axesHelper = new AxesHelper(finalSize * 0.8);
                    this._axesHelper.renderOrder = 999;
                    this._axesHelper.onBeforeRender = (renderer) => renderer.clearDepth();
                    this._scene.add(this._axesHelper);
                }
            }
        } else {
            this.removeGrid();
        }
    }

    public OnResize(): void {
        const { clientHeight, clientWidth } = this._el;
        this._defaultCamera.aspect = clientWidth / clientHeight;
        this._defaultCamera.updateProjectionMatrix();
        this._renderer.setSize(clientWidth, clientHeight);

        this._axesCornerHelper?.OnResize();
        this._effectManager.OnResize(clientWidth, clientHeight);
    }

    private OnUpdate(dt: number) {
        this._controls.update();
        this._mixer?.update(dt);
        if (this._effectManager.enablePass === false) {
            this._renderer.render(this._scene, this._activeCamera);
        }
        this._axesCornerHelper?.OnUpdate();
        this._effectManager.OnUpdate();
        this._viewHelper?.OnUpdate(dt);
    }

    private setContent(object: Group, clips: Array<AnimationClip>) {
        this.Clear();
        this._content = object;

        object.updateMatrixWorld();

        const box = new Box3().setFromObject(object);
        const size = box.getSize(new Vector3()).length();
        const center = box.getCenter(new Vector3());

        this._controls.reset();

        // object.position.x += (object.position.x - center.x);
        // object.position.y += (object.position.y - center.y);
        // object.position.z += (object.position.z - center.z);

        this._controls.maxDistance = size * 10;
        this._defaultCamera.near = size / 100;
        this._defaultCamera.far = size * 100;
        this._defaultCamera.updateProjectionMatrix();
        
        
        this._defaultCamera.position.copy(center);
        this._defaultCamera.position.x += size / 2.0;
        this._defaultCamera.position.y += size / 5.0;
        this._defaultCamera.position.z += size / 2.0;
        this._defaultCamera.lookAt(center);
        this.fitNode(object, false);

        this._axesCornerHelper?.UpdateWhenLoadModel(size);

        this._controls.saveState();
        this._scene.add(object);
        

        // @ts-ignore
        window.globalobj = object;

        this._content.traverse((node: Object3D) => {
            const mesh = node as Mesh;
            if ((node as Light).isLight) {
              this._config.punctualLights = false;
            } else if (mesh.isMesh) {
              // TODO(https://github.com/mrdoob/three.js/pull/18235): Clean up.
              let materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach(it => it.depthWrite = !it.transparent);
            }
        });

        this.setClips(clips);
        this.setNodeTree();
        this.setOriginInfo();
        this.SetDoubleSide(this._state.doubleSide, true);

        this.updateLights();
        this.updateGrid(size, true);
    }

    private fitNode(node: Object3D, withTween: boolean = false): void {
        if (node) {
            let startCamera: TX.Camera = this._helper.ConvetCamera(this._activeCamera, this._controls);
            const boundingBox = new THREE.Box3().setFromObject(node);
            const size = boundingBox.getSize(new THREE.Vector3());
            const center = boundingBox.getCenter(new THREE.Vector3());
            const radius = size.length() / 2;
            const endCamera = this.getFitToSphereCamera(
                startCamera, this._helper.Vec3ToCoord3(center), radius);
            if (withTween) {
                this.TweenSetCamera(startCamera, endCamera);
            } else {
                this.SetCameraPositionAndTarget(endCamera.position, endCamera.target);
            }
        }
    }

    private getObject3DFromID(nodeID: number | null): Object3D | null {
        if (!this._content) {
            return null;
        }
        if (nodeID === null) {
            return this._content;
        }
        return this._content.getObjectById(nodeID) || null;
    }

    private setOriginInfo() {
        this._originNodeMaterialMap.clear();
        if (this._content) {
            this._content.traverse(it => {
                const mesh = it as Mesh;
                let materials: Array<Material> = [];
                if (mesh.isMesh && mesh.material) {
                    Array.isArray(mesh.material) ? materials = mesh.material : materials = [mesh.material];
                }
                this._originNodeMaterialMap.set(mesh.id, materials);
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
                effectState: {
                    wireframe: false,
                    normal: false,
                    boundingbox: false,
                    axes: false,
                }
            };
            box.getSize(curNodeSimpleInfo.boundingBox);
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
        // console.error(nodeTree);
        this.setNodeTreeRedundancy(nodeTree);
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
        this._effectManager.UnSelect();
        this._currentSelectedNodes = [];
        this._selectedNodeInfo = [];
    }

    // 选中node
    private selectNode(node: Object3D): boolean {
        this._currentSelectedNodes.push(node);
        this._selectedNodeInfo.push(this._nodeTreeMap.get(node.id)!);
        this._effectManager.Select(node);
        return true;
    }

    public UpdateLight(light: ILight): void {
        const lightIns = this._lights.get(light.type);
        if (lightIns) {
            lightIns.intensity = light.intensity;
            lightIns.color.set(light.color);
        }
    }

    public ShowGrid(mark: boolean): void {
        this._state.grid = mark;
        this.updateGrid(0, false);
    }

    public IsGridShow(): boolean {
        return this._state.grid;
    }

    public SetBackgroundColor(val: string): void {
        if (this._state.environmentType === 'none') {
            this._state.backgroundColor = val;
            this._scene.background = new Color(val);
        }
    }

    public GetBackgroundColor(): string {
        return this._state.backgroundColor;
    }

    public SetDoubleSide(mark: boolean, force?: boolean): void {
        if(!this._content) {
            return;
        }
        if (mark === this._state.doubleSide && force !== true) {
            return;
        }
        THREEUtils.TraverseMaterials(this._content, (material: Material) => {
            material.side = mark ? THREE.DoubleSide : THREE.FrontSide;
            return true;
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

    public PlayAnimationWithName(name: string, isPlay: boolean = true, speed: number = 1, type: AnimationPlayMode = 'once'): void {
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
                action.reset();
                if (isPlay) {
                    action.loop = loopType;
                    action.timeScale = speed;
                    if (action.isRunning()) {
                        action.stop();
                    }
                    action.play();
                } else {
                    action.stop();
                }
            }
        }
    }

    public SetCameraPositionAndTarget(position: TX.Coord3D, target: TX.Coord3D): boolean {
        this._activeCamera.position.copy(this._helper.Coord3ToVec3(position));
        this._controls.target.set(target.x, target.y, target.z);
        return true;
    }

    public FitNodeWithID(nodeID: number): void {
        const node = this._content?.getObjectById(nodeID);
        if (node) this.fitNode(node, true);
    }

    public GetMaterials(): Array<MaterialBase> {
        const materialMap: Map<number, MaterialBase> = new Map<number, MaterialBase>();
        this._content?.traverse(it => {
            const mesh = it as Mesh;
            if (mesh.isMesh && mesh.material) {
                let curMaterials = [];
                if (Array.isArray(mesh.material)) {
                    curMaterials = mesh.material;
                } else {
                    curMaterials = [mesh.material];
                }
                curMaterials.forEach(curMaterial => {
                    if (materialMap.has(curMaterial.id) === false) {
                        // materialMap.set(curMaterial.id, curMaterial);
                    }
                })
            }
        });
        console.error(materialMap);
        return [];
    }

    public GetMaterialInfo(nodeID: number): Array<MaterialBase> {
        let rv: Array<MaterialBase> = [];
        if (this._originNodeMaterialMap.has(nodeID)) {
            const originMaterials: Array<Material> = this._originNodeMaterialMap.get(nodeID)!;
            rv = originMaterials.map(it => this._helper.ConvertMaterial(it));
        }
        return rv;
    }

    // 显示小的坐标轴辅助
    public ShowMinAxes(mark: boolean): boolean {
        this._state.minAxes = mark;
        if (this._viewHelper) return this._viewHelper.Show(mark);
        if (this._axesCornerHelper) return this._axesCornerHelper.Show(mark);
        return false
    }

    // 自动旋转
    public AutoRotate(mark: boolean) {
        if (!this._content) return false;
        this._state.autoRotate = mark;
        this._controls.autoRotate = mark; 
        return true;
    }

    // 根据node id显示node
    public ShowNodeWithID(nodeID: number, isShow: boolean = true, recursive: boolean = true): boolean {
        const node = this._content?.getObjectById(nodeID);
        if (!node) {
            return false;
        }
        return THREEUtils.ShowNode(node, isShow, recursive)
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
            loaderIns.Clean();
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
    }

    public Clear() {
        if (this._content) {
            this._scene.remove(this._content);
            // dispose geometry
            THREEUtils.TraverseNodes(this._content, (node: Object3D) => {
                (node as Mesh).geometry.dispose();
                return true;
            }, true);

            // dispose textures
            THREEUtils.TraverseMaterials(this._content, (material: any) => {
                for ( const key in material ) {
                    if (key !== 'envMap' && material[key] && material[key].isTexture) {
                        material[key].dispose();
                    }
                }
                return true;
            });
        }
        this._effectManager.Clear();
    }

    public PlayAllAnimation(): void {
        this._clips.forEach((clip) => {
            this._mixer?.clipAction(clip).reset().play();
        });
    }

    public ShowNodeWireframe(nodeID: number | null, mark: boolean): boolean {
        const object = this.getObject3DFromID(nodeID);
        if (object === null) {
            return false;
        }
        this._effectManager.ShowWireframe(object, mark);
        this.TraverseNodeInfo(object.id, nodeInfo => {
            nodeInfo.effectState.wireframe = mark;
        });
        return true;
    }

    public ShowNodeNormal(nodeID: number | null, mark: boolean): boolean {
        const object = this.getObject3DFromID(nodeID);
        if (object === null) {
            return false;
        }
        this._effectManager.ShowNormal(object, mark);
        this.TraverseNodeInfo(object.id, nodeInfo => {
            nodeInfo.effectState.normal = mark;
        });
        return true;
    }

    public ShowBoundingBox(nodeID: number | null, mark: boolean): boolean {
        const object = this.getObject3DFromID(nodeID);
        if (object === null) {
            return false;
        }
        this._effectManager.ShowBoundingBox(object, mark);
        this.TraverseNodeInfo(object.id, nodeInfo => {
            nodeInfo.effectState.boundingbox = mark;
        });
        return true;
    }

    public GetEnvironment(): EnvironmentType {
        return this._state.environmentType;
    }

    public async SetEnvironment(type: EnvironmentType): Promise<boolean> {
        let rv = false;
        if (type === 'none') {
            this._scene.background = new Color(this._state.backgroundColor);
            this._scene.environment = null;
            rv = true;
        } else {
            const envMap = await this._helper.GetEnvironment(type);
            if (envMap) {
                this._scene.environment = envMap;
                this._scene.background = envMap;
                rv = true;
            }
        }
        if (rv === true) {
            this._state.environmentType = type;
        }
        return rv;
    }

    public Export(modelType: ModelType, opts?: ExportOption): Promise<Blob | null> {
        let exporter: THREEExporterBase | null = null;
        switch(modelType) {
            case ModelType.GLTF:
                exporter = new THREEExporterGLTF();
                break;
            case ModelType.STL:
                exporter = new THREEExporterSTL();
                break;
            default:
                exporter = null;
                break;
        }
        if (exporter && this._content) {
            if (opts) {
                exporter.binary = opts.isBinary;
                exporter.withAnimation = opts.withAnimation;
            }
            exporter.animationClips = this._clips;
            return exporter.Export(this._content);
        }
        return Promise.resolve(null);
    }
}