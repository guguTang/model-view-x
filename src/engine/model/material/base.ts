import { RGBColor } from '../color';
import { TextureMap } from './texture';
import { MaterialType } from './types';

export class MaterialBase {
    private _type: MaterialType;
    private _name: string;
    private _color: RGBColor;
    // private _vertexColors: boolean;
    constructor(type: MaterialType, name: string) {
        this._type = type;
        this._name = name;
        this._color = new RGBColor (0, 0, 0);

        // this._vertexColors = false;
    }

    public set color(val: RGBColor) {
        this._color = val;
    }

    public set vertexColors(val: boolean) {
        // this._vertexColors = val;
        console.log(val);
    }

    public get type(): MaterialType {
        return this._type;
    }

    public get name(): string {
        return this._name;
    }

    public get color(): RGBColor {
        return this._color;
    }
}

export class MaterialFace extends MaterialBase {
    public _emissive: RGBColor;
    public _emissiveIntensity: number;
    public _aoMap: TextureMap | null;
    public _aoMapIntensity: number;
    public _opacity: number;
    public _transparent: boolean;
    public _diffuseMap: TextureMap | null;
    public _bumpMap: TextureMap | null;
    public _normalMap: TextureMap | null;
    public _emissiveMap: TextureMap | null;
    public _alphaTest: number;
    public _multiplyDiffuseMap: boolean;
    constructor(type: MaterialType, name: string) {
        super(type, name);
        this._emissive = new RGBColor(0, 0, 0);
        this._emissiveIntensity = 1;

        this._opacity = 1.0; // 0.0 .. 1.0
        this._transparent = false;
        this._aoMapIntensity = 0.0;

        this._diffuseMap = null;
        this._bumpMap = null;
        this._normalMap = null;
        this._emissiveMap = null;
        this._aoMap = null;

        this._alphaTest = 0.0; // 0.0 .. 1.0
        this._multiplyDiffuseMap = false;
    }

    public get diffuseMap(): TextureMap | null {
        return this._diffuseMap;
    }

    public get aoMap(): TextureMap | null {
        return this._aoMap;
    }

    public get emissive(): RGBColor {
        return this._emissive;
    }

    public get emissiveMap(): TextureMap | null {
        return this._emissiveMap;
    }

    public get aoMapIntensity(): number {
        return this._aoMapIntensity;
    }

    public get opacity(): number {
        return this._opacity;
    }

    public get emissiveIntensity(): number {
        return this._emissiveIntensity;
    }

    public set emissive(val: RGBColor) {
        this._emissive = val;
    }

    public set emissiveIntensity(val: number) {
        this._emissiveIntensity = val;
    }

    public set opacity(val: number) {
        this._opacity = val;
    }

    public set transparent(val: boolean) {
        this._transparent = val;
    }

    public set alphaTest(val: number) {
        this._alphaTest = val;
    }

    public set multiplyDiffuseMap(val: boolean) {
        this._multiplyDiffuseMap = val;
    }

    public set diffuseMap(val: TextureMap) {
        this._diffuseMap = val;
    }

    public set bumpMap(val: TextureMap) {
        this._bumpMap = val;
    }

    public set normalMap(val: TextureMap) {
        this._normalMap = val;
    }

    public set emissiveMap(val: TextureMap) {
        this._emissiveMap = val;
    }

    public set aoMap(val: TextureMap) {
        this._aoMap = val;
    }

    public set aoMapIntensity(val: number) {
        this._aoMapIntensity = val;
    }
}