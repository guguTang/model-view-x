import { Coord3D } from '../geomerty/coord3d.js';
import GeomUtils from '../geomerty/utils.js';

export class Camera {
    private _position: Coord3D;
    private _target: Coord3D;
    private _up: Coord3D;
    private _fov: number;
    constructor(position: Coord3D, target: Coord3D, up: Coord3D, fov: number) {
        this._position = position;
        this._target = target;
        this._up = up;
        this._fov = fov;
    }

    public get position(): Coord3D {
        return this._position;
    }

    public get target(): Coord3D {
        return this._target;
    }

    public get up(): Coord3D {
        return this._up;
    }

    public get fov(): number {
        return this._fov;
    }

    public set position(val: Coord3D) {
        this._position = val;
    }

    public set target(val: Coord3D) {
        this._target = val;
    }

    public set up(val: Coord3D) {
        this._up = val;
    }

    public set fov(val: number) {
        this._fov = val;
    }

    public Clone() {
        return new Camera (
            this._position.Clone(),
            this._target.Clone(),
            this._up.Clone(),
            this._fov
        );
    }

    public IsEqual(val: Camera) {
        return this.position.IsEqual(val.position)
            && this.target.IsEqual(val.target) 
            && this.up.IsEqual(val.up)
            && GeomUtils.IsEqual(this.fov, val.fov);
    }
}