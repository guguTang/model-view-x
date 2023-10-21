import { EventType, GlobalBUS, IEventBandDataForSingleClickOnView3D } from './bus';
import { ExportOption } from './export/index';
import { ModelType } from './folder/file';
import { MaterialBase } from './model/material/index';
import { DefaultRenderConfig, RenderConfig, RenderType } from './render/config';
import { INodeSimpleInfo, AnimationPlayMode, ILight, EnvironmentType } from './render/info-struct';
import { Render } from './render/render';
import { RenderThreejs } from './render/render-threejs';
import { LoaderOpts } from '@/engine/render/loader/loader';

class TXEngineWrapper {
    private _renderer: Render | null = null;
    constructor() {

    }

    public get Render(): Render | null {
        return this._renderer;
    }

    public HasContent(): boolean {
        return !!this._renderer?.HasContent();
    }

    public CreateRenderer(el: HTMLElement, axesel: HTMLElement, opts: RenderConfig = DefaultRenderConfig): Render | null {
        if (opts.renderType === RenderType.THREEJS) {
            this._renderer = new RenderThreejs(el, axesel, opts);
        }
        return this._renderer;
    }

    public async Load(opts: LoaderOpts): Promise<boolean> {
        if (!this._renderer) {
            return false;
        }
        const rv = await this._renderer.Load(opts);
        GlobalBUS.Emit(EventType.LoadSceneDone, {
            id: EventType.LoadSceneDone,
            name: EventType.LoadSceneDone,
            value: rv,
        });
        return rv;
    }

    public async LoadFromURL(url: string): Promise<boolean> {
        if (!this._renderer) {
            return false;
        }

        const rv = await this._renderer.LoadFromUrl(url);
        GlobalBUS.Emit(EventType.LoadSceneDone, {
            id: EventType.LoadSceneDone,
            name: EventType.LoadSceneDone,
            value: rv.toString(),
        });
        return rv;
    }

    public get NodeSimpleTree(): Array<INodeSimpleInfo> {
        if (!this._renderer) {
            return [];
        }
        return this._renderer.NodeSimpleTree;
    }

    public ShowNodeWithID(nodeID: number, isShow: boolean = true, recursive: boolean = true): boolean {
        if (!this._renderer) {
            return false;
        }
        return this._renderer.ShowNodeWithID(nodeID, isShow,recursive);
    }

    public SelectNodeWithID(nodeID: number | null): boolean {
        if (!this._renderer) {
            return false;
        }
        return this._renderer.SelectNodeWithID(nodeID);
    }

    public AddSingleClickEventToBUS(): boolean {
        if (!this._renderer) {
            return false;
        }
        this._renderer.SetSingleClickCallback((objectID: number | null): boolean => {
            const data: IEventBandDataForSingleClickOnView3D = {
                name: EventType.SingleClickOnView3D,
                id: EventType.SingleClickOnView3D,
                objectID: objectID,
            };
            GlobalBUS.Emit(EventType.SingleClickOnView3D, data);
            return true;
        });
        return true;
    }

    public GetSelectedNode(rootBackup: boolean = true): INodeSimpleInfo | null {
        if (!this._renderer) {
            return null;
        }
        let nodeInfo = this._renderer.CurrentSelectedNodeInfo;
        if (nodeInfo === null && rootBackup === true) {
            nodeInfo = this._renderer.NodeSimpleTree.length > 0? this._renderer.NodeSimpleTree[0] : null;
            // const rootNodeInfo: INodeSimpleInfo = {
            //     children: this._renderer.NodeSimpleTree,
            //     id: 0,
            //     name: 'Root',
            //     isMesh: false,
            //     vertices: 0,
            //     triangles: 0,
            //     boundingBox: IVector3,
            // }
        }
        return nodeInfo;
    }

    public SetBackgroundColor(val: string): void {
        this._renderer?.SetBackgroundColor(val);
    }

    public GetBackgroundColor(): string {
        if (!this._renderer) {
            return '#000000';
        }
        return this._renderer?.GetBackgroundColor();
    }

    public GetEnvironment(): EnvironmentType {
        if (!this._renderer) {
            return 'none';
        }
        return this._renderer.GetEnvironment();
    }

    public async SetEnvironment(type: EnvironmentType): Promise<boolean> {
        if (!this._renderer) {
            return false;
        }
        return this._renderer?.SetEnvironment(type);
    }

    public SetDoubleSide(mark: boolean): void {
        this._renderer?.SetDoubleSide(mark);
    }

    public IsDoubleSide(): boolean {
        return !!this._renderer?.IsDoubleSide();
    }

    public GetAnimationNames(): Array<string> {
        return this._renderer?.GetAnimationNames() || [];
    }

    public PlayAnimationWithName(name: string, isPlay: boolean, speed: number = 1, type: AnimationPlayMode = 'once'): void {
        this._renderer?.PlayAnimationWithName(name, isPlay, speed, type);
    }

    public FitNodeWithID(nodeID: number): void  {
        this._renderer?.FitNodeWithID(nodeID);
    }

    public GetMaterials(): Array<MaterialBase> {
        if (!this._renderer) {
            return [];
        }
        return this._renderer.GetMaterials();
    }

    public GetMaterialInfo(nodeID: number): Array<MaterialBase> {
        if (!this._renderer) {
            return [];
        }
        return this._renderer?.GetMaterialInfo(nodeID);
    }

    public UpdateLight(light: ILight): void {
        this._renderer?.UpdateLight(light);
    }

    public ShowGrid(mark: boolean): void {
        this._renderer?.ShowGrid(mark);
    }

    public ShowMinAxes(mark: boolean): boolean {
        if (!this._renderer) {
            return false;
        }
        return this._renderer.ShowMinAxes(mark);
    }

    public AutoRotate(mark: boolean): boolean {
        if (!this._renderer) {
            return false;
        }
        return this._renderer.AutoRotate(mark);
    }

    public IsGridShow(): boolean {
        return !!this._renderer?.IsGridShow();
    }

    public ShowSelectedWireframe(mark: boolean): boolean {
        if (!this._renderer) {
            return false;
        }
        const nodeInfo = this.GetSelectedNode(true);
        if (nodeInfo === null) {
            return false;
        }
        return this._renderer.ShowNodeWireframe(nodeInfo.id, mark);
    }

    public ShowSelectedNormal(mark: boolean) :boolean {
        if (!this._renderer) {
            return false;
        }
        const nodeInfo = this.GetSelectedNode(true);
        if (nodeInfo === null) {
            return false;
        }
        return this._renderer.ShowNodeNormal(nodeInfo.id, mark);
    }

    public ShowSelectedBoundingbox(mark: boolean) :boolean {
        if (!this._renderer) {
            return false;
        }
        const nodeInfo = this.GetSelectedNode(true);
        if (nodeInfo === null) {
            return false;
        }
        return this._renderer.ShowBoundingBox(nodeInfo.id, mark);
    }

    public Export(modelType: ModelType, opts?: ExportOption): Promise<Blob | null> {
        if (!this._renderer) {
            return Promise.resolve(null);
        }
        return this._renderer.Export(modelType, opts);
    }
};

export const TXEngine = new TXEngineWrapper();