import { Object3D, WebGLRenderer, MeshBasicMaterial, Material, Mesh, BoxHelper } from 'three';
import * as THREE from 'three';
import { EffectComposer  } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
// import { OutlinePass } from "./outlinepass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
// import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js';
// import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { THREEUtils } from './utils';

export default class THREEEffect {
    private _el: HTMLElement;
    private _renderer: WebGLRenderer;
    private _scene: THREE.Scene;
    // outline hightlight
    private _enablePass: boolean = true;
    private _composer: EffectComposer;
    private _smaaPass: SMAAPass;
    private _renderPass: RenderPass;
    private _outlinePass: OutlinePass;
    private _fxaaPass: ShaderPass;
    private _outlinePassColor: number;

    // selected effect
    private _wireFrameMap: Map<number, Object3D> = new Map<number, Object3D>();
    //     vertex normal helper
    private _normalObjectMap: Map<number, VertexNormalsHelper> = new Map<number, VertexNormalsHelper>();
    //     bounding box helper
    private _boundingboxObjectMap: Map<number, BoxHelper> = new Map<number, BoxHelper>();
    //     outline
    private _outlineObjectList: Array<Object3D> = [];
    
    constructor(el: HTMLElement, renderer: WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        this._el = el;
        this._scene = scene;
        this._outlinePassColor = 0xf7cb00;
        this._renderer = renderer;
        this._composer = new EffectComposer(this._renderer);
        const { clientHeight, clientWidth } = this._el;
        
        // let fxaaPass = new ShaderPass(FXAAShader)
        // const pixelRatio = this._renderer.getPixelRatio();
        // fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / (this._el.offsetWidth * pixelRatio);
        // fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / (this._el.offsetHeight * pixelRatio);
        // this._composer.addPass(fxaaPass);

        
        // const pixelRatio = this._renderer.getPixelRatio();
        // this._fxaaPass.material.uniforms.resolution.value.x = 1 / (this._el.offsetWidth * pixelRatio);
        // this._fxaaPass.material.uniforms.resolution.value.y = 1 / (this._el.offsetHeight * pixelRatio);
        

        // 发光效果
        // const unrealBloomPass = new UnrealBloomPass();
        // unrealBloomPass.strength = 0.1;
        // // unrealBloomPass.radius = 0;
        // unrealBloomPass.threshold = 1;
        // composer.addPass(unrealBloomPass);

        this._renderPass = new RenderPass(this._scene, camera);
        if (this._enablePass) this._composer.addPass(this._renderPass);

        // 颜色修正
        // const gammaCorrectionShader = new ShaderPass(GammaCorrectionShader);
        // this._composer.addPass(gammaCorrectionShader);

        // 变暗问题
        const outputPass = new OutputPass();
        this._composer.addPass(outputPass);

        // 抗锯齿
        this._smaaPass = new SMAAPass(clientWidth, clientHeight);
        this._composer.addPass(this._smaaPass);

        this._fxaaPass = new ShaderPass(FXAAShader);
        this._fxaaPass.uniforms.resolution.value.set(1 / clientWidth, 1 / clientHeight);
        this._fxaaPass.renderToScreen = true;
        this._composer.addPass(this._fxaaPass);

        this._outlinePass = new OutlinePass(new THREE.Vector2(clientWidth, clientHeight), scene, camera);
        this._composer.addPass(this._outlinePass);
        this.configOutlinePass();
    }

    public Clear() {
        this._normalObjectMap.forEach(it => this._scene.remove(it));
        this._boundingboxObjectMap.forEach(it => this._scene.remove(it));
        this._outlineObjectList.forEach(it => this.RemoveOutline(it));

        this._normalObjectMap.clear();
        this._boundingboxObjectMap.clear();
        this._outlineObjectList = [];
    }

    public ShowWireframe(node: Object3D, mark: boolean): void {
        THREEUtils.TraverseNodes(node, (curNode: Object3D, materials?: Array<Material>): boolean => {
            materials?.forEach(it => {
                (it as MeshBasicMaterial).wireframe = mark;
            });
            if (mark === false) {
                this._wireFrameMap.delete(curNode.id);
            } else {
                this._wireFrameMap.set(curNode.id, curNode);
            }
            return true;
        });
    }

    public ShowNormal(node: Object3D, mark: boolean): void {
        THREEUtils.TraverseNodes(node, (node: Object3D | Mesh) => {
            const mesh = node as Mesh;
            if (mesh.geometry.attributes.normal) {
                const oldVnh = this._normalObjectMap.get(node.id);
                if (oldVnh) {
                    this._scene.remove(oldVnh);
                }
                if (mark === false) {
                    this._normalObjectMap.delete(node.id);
                } else {
                    const vnh = new VertexNormalsHelper(mesh, 0.1);
                    THREEUtils.TraverseMaterials(vnh, (material): boolean => {
                        material.depthWrite = false;
                        return true;
                    });
                    this._normalObjectMap.set(node.id, vnh);
                    this._scene.add(vnh);
                }
            }
            return true;
        }, true);
    }

    public ShowBoundingBox(node: Object3D, mark: boolean): void {
        THREEUtils.TraverseNodes(node, (node: Object3D | Mesh) => {
            const oldObj = this._boundingboxObjectMap.get(node.id);
            if (oldObj) {
                this._scene.remove(oldObj);
            }
            if (mark === false) {
                this._boundingboxObjectMap.delete(node.id);
            } else {
                const boxObj = new BoxHelper(node, 0xffffff);
                boxObj.material.depthWrite = false;
                this._boundingboxObjectMap.set(node.id, boxObj);
                this._scene.add(boxObj);
            }
            return true;
        });
    }

    private configOutlinePass() {
        this._outlinePass.pulsePeriod = 3; // 呼吸闪烁的速度
        this._outlinePass.visibleEdgeColor = new THREE.Color(this._outlinePassColor); // 呼吸显示的颜色
        // this._outlinePass.hiddenEdgeColor = new THREE.Color(0, 0, 0); // 呼吸消失的颜色
        this._outlinePass.edgeStrength = 8; // 边框的亮度
        this._outlinePass.edgeThickness = 2; // 边框宽度
        this._outlinePass.edgeGlow = 1// 光晕[0,1]
        this._outlinePass.usePatternTexture = false; // 是否使用父级的材质
        
        this._outlinePass.downSampleRatio = 1 // 边框弯曲度
        // this._outlinePass.clear = true;
    }

    public OnResize(width: number, height: number) {
        this._fxaaPass.uniforms.resolution.value.set(1 / width, 1 / height);
        this._smaaPass.setSize(width, height);
        this._composer.setSize(width, height);
    }

    public get enablePass(): boolean {
        return this._enablePass;
    }

    public OnUpdate() {
        if (this._enablePass) {
            this._composer.render();
        }
        // this._vertexNormalHelperObjs.forEach(it => it.update());
        this._normalObjectMap.forEach(it => it.update());
    }

    public AddOutline(node: Object3D) {
        THREEUtils.TraverseNodes(node, (curNode: Object3D): boolean => {
            const mesh = curNode as THREE.Mesh;
            const edgesGeometry = new THREE.EdgesGeometry(mesh.geometry);
            const outline = new THREE.LineSegments(edgesGeometry, new THREE.LineBasicMaterial({
                color: this._outlinePassColor,
                linewidth: 100,
            }));
            outline.material.depthWrite = false;
            curNode.add(outline);
            this._outlineObjectList.push(curNode);
            return true;
        }, true);
    }

    public RemoveOutline(node?: Object3D) {
        let finalNodes: Array<Object3D> = [];
        if (node) {
            finalNodes = [node];
        } else {
            finalNodes = this._outlineObjectList;
        }
        finalNodes.forEach(it => {
            THREEUtils.TraverseNodes(it, (curNode: Object3D): boolean => {
                const lines = curNode.children.filter((it) => (it as THREE.LineSegments).isLineSegments);
                lines.forEach(it => curNode.remove(it));
                return true;
            }, true);
            this._outlineObjectList = this._outlineObjectList.filter(cur => cur !== it);
        });
    }

    public AddOutlinePass(node: Object3D) {
        if (this._enablePass === false) return;
        this._outlinePass.selectedObjects = [node];
        /*
        composer = new Effect(renderer)
        composer.renderTarget1.texture.outputColorSpace = THREE.sRGBEncoding;
        composer.renderTarget2.texture.outputColorSpace = THREE.sRGBEncoding;
        composer.renderTarget1.texture.encoding = THREE.sRGBEncoding;
        composer.renderTarget2.texture.encoding = THREE.sRGBEncoding;

        renderPass = new RenderPass(scene, camera)
        composer.addPass(renderPass);

        outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera, selectedObjects)
        outlinePass.selectedObjects = selectedObjects
        outlinePass.edgeStrength = 10.0 // 边框的亮度
        outlinePass.edgeGlow = 0.5// 光晕[0,1]
        outlinePass.usePatternTexture = false // 是否使用父级的材质
        outlinePass.edgeThickness = 1.0 // 边框宽度
        outlinePass.downSampleRatio = 1 // 边框弯曲度
        outlinePass.pulsePeriod = 5 // 呼吸闪烁的速度
        outlinePass.visibleEdgeColor.set(parseInt(0x00ff00)) // 呼吸显示的颜色
        outlinePass.hiddenEdgeColor = new THREE.Color(0, 0, 0) // 呼吸消失的颜色
        outlinePass.clear = true
        composer.addPass(outlinePass)
        // 自定义的着色器通道 作为参数
        effectFXAA = new ShaderPass(FXAAShader)
        effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight)
        effectFXAA.renderToScreen = true
        composer.addPass(effectFXAA)
        // 抗锯齿
        smaaPass = new SMAAPass();
        composer.addPass(smaaPass);
        // 发光效果
        unrealBloomPass = new UnrealBloomPass();
        unrealBloomPass.strength = 0.1;
        // unrealBloomPass.radius = 0;
        unrealBloomPass.threshold = 1;
        composer.addPass(unrealBloomPass);
        */
    }

    public RemoveOutlinePass(node?: Object3D) {
        if (this._enablePass === false) return;
        if (node !== undefined) {
            this._outlinePass.selectedObjects = this._outlinePass.selectedObjects.filter((it: any) => it !== node);
        } else {
            this._outlinePass.selectedObjects = [];
        }
    }

    public Select(node: Object3D) {
        // this.AddOutline(node);
        this.AddOutlinePass(node);
    }

    public UnSelect(node?: Object3D) {
        // this.RemoveOutline(node);
        this.RemoveOutlinePass(node);
    }
};