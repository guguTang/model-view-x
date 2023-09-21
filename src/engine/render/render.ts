import { DefaultRenderConfig, RenderConfig } from './config';
import { INodeSimpleInfo, IMaterialInfo, AnimationPlayMode } from './info-struct';
import { DefaultRenderState, RenderState } from './state';
import { LoaderOpts } from './loader/loader';
export type singleClickCallback = (objectID: number | null) => boolean;
export abstract class Render {
    protected _el: HTMLElement;
    protected _axesEl: HTMLElement;
    protected _config: RenderConfig;
    protected _state: RenderState;
    protected _nodeTree: Array<INodeSimpleInfo> = [];
    protected _nodeTreeFlat: Array<INodeSimpleInfo> = [];
    protected _nodeTreeMap: Map<number, INodeSimpleInfo> = new Map<number, INodeSimpleInfo>();
    protected _selectedNodeInfo: Array<INodeSimpleInfo> = [];
    protected _singleClickCallback: singleClickCallback | null = null;
    constructor(el: HTMLElement, axesel: HTMLElement, opts: RenderConfig = DefaultRenderConfig) {
        this._el = el;
        this._axesEl = axesel;
        this._config = opts;
        this._state = JSON.parse(JSON.stringify(DefaultRenderState));
    }

    public get NodeSimpleTree(): Array<INodeSimpleInfo> {
        return this._nodeTree;
    }

    public get NodeSimpleTreeFlat(): Array<INodeSimpleInfo> {
        return this._nodeTreeFlat;
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

    public GetNodeGeomertySimpleInfo(nodeID: number | null) {

    }

    public get CurrentSelectedNodeInfo(): INodeSimpleInfo | null {
        if (this._selectedNodeInfo.length > 0) {
            return this._selectedNodeInfo[0];
        }
        return null;
    }

    public abstract Start(): boolean;
    public abstract HasContent(): boolean;
    public abstract ShowMinAxes(mark: boolean): void;

    public abstract SetBackgroundColor(val: string): void;
    public abstract GetBackgroundColor(): string;

    public abstract SetDoubleSide(mark: boolean, force?: boolean): void;
    public abstract IsDoubleSide(): boolean;

    public abstract GetAnimationNames(): Array<string>;
    public abstract PlayAnimationWithName(name: string, isPlay: boolean, type: AnimationPlayMode): void;

    public abstract GetMaterialInfo(nodeID: number): IMaterialInfo | null;
    public abstract AutoRotate(mark: boolean): void;
    public abstract LoadFromUrl(url: string): Promise<boolean>;
    public abstract Load(opts: LoaderOpts): Promise<boolean>;
    public abstract PlayAllAnimation(): void;
    public abstract ShowWireframe(mark: boolean): void;
    public abstract ShowBoundingBox(mark: boolean): void;
    public abstract ShowNodeWithID(nodeID: number, isShow: boolean, recursive: boolean): boolean;
    public abstract SelectNodeWithID(nodeID: number | null): boolean;
    public SetSingleClickCallback(callback: singleClickCallback) {
        this._singleClickCallback = callback;
    }
}

