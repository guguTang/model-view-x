import { RGBColor } from '../color';
import { MaterialFace } from './base';
import { TextureMap } from './texture';
import { MaterialType } from './types';

export class MaterialPhong extends MaterialFace {
    private _ambient: RGBColor;
    private _specular: RGBColor;
    private _shininess: number;
    private _specularMap: TextureMap | null;
    constructor(name: string) {
        super(MaterialType.Phong, name);

        this._ambient = new RGBColor (0, 0, 0);
        this._specular = new RGBColor (0, 0, 0);
        this._shininess = 0.0; // 0.0 .. 1.0
        this._specularMap = null;
        console.log(this._specularMap);
    }

    public get ambient(): RGBColor {
        return this._ambient;
    }

    public get specular(): RGBColor {
        return this._specular;
    }

    public get shininess(): number {
        return this._shininess;
    }

    public set ambient(color: RGBColor) {
        this._ambient = color;
    }

    public set specular(color: RGBColor) {
        this._specular = color;
    }

    public set shininess(val: number) {
        this._shininess = val;
    }

    public set specularMap(val: TextureMap) {
        this._specularMap = val;
    }
}