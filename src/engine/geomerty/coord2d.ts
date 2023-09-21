export class Coord2D {
    private _x: number;
    private _y: number;
	constructor (x: number, y: number) {
		this._x = x;
		this._y = y;
	}

	Clone () {
		return new Coord2D (this._x, this._y);
	}

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }
}