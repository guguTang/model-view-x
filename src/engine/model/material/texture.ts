import { Coord2D } from '../../geomerty/coord2d';

export class TextureMap {
    private _name: string;
    private _mimeType: string;
    private _offset: Coord2D;
    private _scale: Coord2D;
    private _buffer: ImageBitmap | null | any | Uint8ClampedArray;
    private _rotation: number;
    private _width: number;
    private _height: number;
    private _extra: Map<string, any>;
    constructor () {
        this._name = '';
        this._mimeType = '';
        this._buffer = null;
        this._width = 0;
        this._height = 0;
        this._offset = new Coord2D (0.0, 0.0);
        this._scale = new Coord2D (1.0, 1.0);
        this._rotation = 0.0;
        this._extra = new Map<string, any>();
    }

    public Clone(): TextureMap {
        const rv = new TextureMap();
        rv.name = this._name;
        rv.mimeType = this._mimeType;
        rv.buffer = this._buffer;
        rv.width = this._width;
        rv.height = this._height;
        rv.offset = this._offset;
        rv.scale = this._scale;
        rv.rotation = this._rotation;
        return rv;
    }

    public get name(): string {
        return this._name;
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public get buffer(): any {
        return this._buffer;
    }

    public get offset(): Coord2D {
        return this._offset;
    }

    public get scale(): Coord2D {
        return this._scale;
    }

    public get rotation(): number {
        return this._rotation;
    }

    public get mimeType(): string {
        return this._mimeType;
    }

    public set name(val: string) {
        this._name = val;
    }

    public set width(val: number) {
        this._width = val;
    }

    public set height(val: number) {
        this._height = val;
    }

    public set mimeType(val: string) {
        this._mimeType = val;
    }

    public set offset(val: Coord2D) {
        this._offset = val;
    }

    public set scale(val: Coord2D) {
        this._scale = val;
    }

    public set rotation(val: number) {
        this._rotation = val;
    }

    public set buffer(val: ImageBitmap | Uint8ClampedArray) {
        this._buffer = val;
        // this._width = val.width;
        // this._height = val.height;
    }

    public addExtra(key: string, val: any) {
        this._extra.set(key, val);
    }

    public getExtra(key: string): any {
        return this._extra.get(key);
    }
}