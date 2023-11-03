import * as TWEEN from '@tweenjs/tween.js';
import { DefaultRenderConfig, RenderConfig } from './config';
import { INodeSimpleInfo, AnimationPlayMode, ILight, EnvironmentType } from './info-struct';
import { DefaultRenderState, RenderState } from './state';
import { LoaderOpts } from './loader/loader';
import { MaterialBase } from '../model/material/index';
import * as TX from '@/engine/index';
import { ModelType } from '../folder/file';
import { ExportOption } from '../export/index';
export type singleClickCallback = (objectID: number | null) => boolean;
export type animateCallback = (time: number) => boolean;
export type nodeSimpleInfoCallback = (nodeInfo: INodeSimpleInfo) => void;
export abstract class Render {
    protected _el: HTMLElement;
    protected _axesEl: HTMLElement;
    protected _canvas!: HTMLCanvasElement;
    protected _config: RenderConfig;
    protected _state: RenderState;
    protected _nodeTree: Array<INodeSimpleInfo> = [];
    protected _nodeTreeFlat: Array<INodeSimpleInfo> = [];
    protected _nodeTreeMap: Map<number, INodeSimpleInfo> = new Map<number, INodeSimpleInfo>();
    protected _selectedNodeInfo: Array<INodeSimpleInfo> = [];
    protected _singleClickCallback: singleClickCallback | null = null;
    protected _animateCallback: animateCallback | null = null;
    constructor(el: HTMLElement, axesel: HTMLElement, opts: RenderConfig = DefaultRenderConfig) {
        this._el = el;
        this._axesEl = axesel;
        this._config = opts;
        this._state = DefaultRenderState; //JSON.parse(JSON.stringify(DefaultRenderState));
    }

    public get NodeSimpleTree(): Array<INodeSimpleInfo> {
        return this._nodeTree;
    }

    public get NodeSimpleTreeFlat(): Array<INodeSimpleInfo> {
        return this._nodeTreeFlat;
    }

    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    protected TraverseNodeInfo(node: number | INodeSimpleInfo, callback: nodeSimpleInfoCallback) {
        let rootNodeInfo: INodeSimpleInfo | null = null;
        if (typeof node == 'number') {
            rootNodeInfo = this.GetNodeSimpleInfoWithID(node);
        } else {
            rootNodeInfo = node;
        }
        if (rootNodeInfo !== null) {
            callback(rootNodeInfo);
            rootNodeInfo.children.forEach(it => {
                this.TraverseNodeInfo(it, callback);
            })
        }
    }

    public GetNodeSimpleInfoWithID(nodeID: number): INodeSimpleInfo | null {
        let rv = this._nodeTreeMap.get(nodeID);
        if (!rv) {
            return null;
        }
        return rv;
    }

    public Start(): boolean {

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
        return true;
    }

    private animate(time: number): void {
        requestAnimationFrame(this.animate);
        TWEEN.update();
        if (this._animateCallback !== null) {
            this._animateCallback(time);
        }
    }

    protected setNodeTreeRedundancy(nodeTree: Array<INodeSimpleInfo>) {
        this._nodeTree = nodeTree;
        this._nodeTreeFlat = [];
        this._nodeTreeMap = new Map<number, INodeSimpleInfo>();
        const recursion = (curData: Array<INodeSimpleInfo>) => {
            curData.forEach((it) => {
                this._nodeTreeFlat.push(it);
                this._nodeTreeMap.set(it.id, it);
                if (it.children) {
                    recursion(it.children);
                }
            });
        };
        recursion(this._nodeTree);
    }

    public get CurrentSelectedNodeInfo(): INodeSimpleInfo | null {
        if (this._selectedNodeInfo.length > 0) {
            return this._selectedNodeInfo[0];
        }
        return null;
    }

    protected getFitToSphereCamera(cam: TX.Camera, objCenter: TX.Coord3D, radius: number): TX.Camera {
        let rvCam = cam.Clone();
        let offsetToOrigo = rvCam.target.Sub(objCenter);
        rvCam.position = rvCam.position.Sub(offsetToOrigo); 
        rvCam.target = objCenter.Clone();

        let centerEyeDirection = rvCam.position.Sub(rvCam.target).Normalize();
        let fieldOfView = cam.fov / 2.0;
        if (this.canvas.width < this.canvas.height) {
            fieldOfView = fieldOfView * this.canvas.width / this.canvas.height;
        }
        let distance = radius / Math.sin (fieldOfView * TX.CONST.DegRad);
        rvCam.position = rvCam.target.Clone().Offset(centerEyeDirection, distance);
        return rvCam;
    }

    protected TweenSetCamera(start: TX.Camera, end: TX.Camera) {
        new TWEEN.Tween({
            position: start.position,
            target: start.target,
        }).to({
            position: end.position,
            target: end.target,
        }, 800).onUpdate((val) => {
            this.SetCameraPositionAndTarget(val.position, val.target);
        }).start();
    }

    public abstract OnResize(): void;

    // public abstract SetCamera(cam: TX.Camera): boolean;
    protected abstract SetCameraPositionAndTarget(position: TX.Coord3D, target: TX.Coord3D): boolean;
    // public abstract Start(): boolean;
    public abstract HasContent(): boolean;
    public abstract ShowMinAxes(mark: boolean): boolean;

    public abstract SetEnvironment(type: EnvironmentType): Promise<boolean>;
    public abstract GetEnvironment(): EnvironmentType;
    public abstract SetBackgroundColor(val: string): void;
    public abstract GetBackgroundColor(): string;

    public abstract SetDoubleSide(mark: boolean, force?: boolean): void;
    public abstract IsDoubleSide(): boolean;

    public abstract GetAnimationNames(): Array<string>;
    public abstract PlayAnimationWithName(name: string, isPlay: boolean, speed: number, type: AnimationPlayMode): void;

    public abstract UpdateLight(light: ILight): void;

    public abstract ShowGrid(mark: boolean): void;
    public abstract IsGridShow(): boolean;

    public abstract FitNodeWithID(nodeID: number): void;

    public abstract GetMaterials(): Array<MaterialBase>;
    public abstract GetMaterialInfo(nodeID: number): Array<MaterialBase>;

    public abstract AutoRotate(mark: boolean): boolean;
    public abstract LoadFromUrl(url: string): Promise<boolean>;
    public abstract Load(opts: LoaderOpts): Promise<boolean>;
    public abstract PlayAllAnimation(): void;

    // public abstract ShowWireframe(mark: boolean): void;
    public abstract ShowNodeWireframe(nodeID: number | null, mark: boolean): boolean;
    public abstract ShowNodeNormal(nodeID: number | null, mark: boolean): boolean;
    public abstract ShowBoundingBox(nodeID: number | null, mark: boolean): boolean;

    public abstract ShowNodeWithID(nodeID: number, isShow: boolean, recursive: boolean): boolean;
    public abstract SelectNodeWithID(nodeID: number | null): boolean;
    public abstract Export(modelType: ModelType, opts?: ExportOption): Promise<Blob | null>;
    
    public SetSingleClickCallback(callback: singleClickCallback) {
        this._singleClickCallback = callback;
    }
}

