import { MaterialFace } from './base';
import { TextureMap } from './texture';
import { MaterialType } from './types';

export class MaterialPhysical extends MaterialFace {
    private _metalness: number;
    private _roughness: number;
    private _metalnessMap: TextureMap | null;
    private _roughnessMap: TextureMap | null;
    constructor(name: string) {
        super(MaterialType.Physical, name);

        this._metalness = 0.0;
        this._roughness = 1.0;
        this._metalnessMap = null;
        this._roughnessMap = null;
    }

    public get metalness(): number {
        return this._metalness;
    }

    public get roughness(): number {
        return this._roughness;
    }

    public get metalnessMap(): TextureMap | null {
        return this._metalnessMap;
    }

    public get roughnessMap(): TextureMap | null {
        return this._roughnessMap;
    }

    public set metalness(val: number) {
        this._metalness = val;
    }

    public set roughness(val: number) {
        this._roughness = val;
    }

    public set metalnessMap(val: TextureMap) {
        this._metalnessMap = val;
    }

    public set roughnessMap(val: TextureMap) {
        this._roughnessMap = val;
    }
}