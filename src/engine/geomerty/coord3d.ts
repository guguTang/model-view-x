import GeomUtils from './utils.js';

export class Coord3D {
    public x: number;
    public y: number;
    public z: number;
	constructor(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	public Length(): number {
		return Math.sqrt (this.x * this.x + this.y * this.y + this.z * this.z);
	}

	public MultiplyScalar(scalar: number): Coord3D {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}

	public Normalize(): Coord3D {
		let length = this.Length ();
		if (length > 0.0) {
			this.MultiplyScalar (1.0 / length);
		}
		return this;
	}

	public Offset(direction: Coord3D, distance: number): Coord3D {
		let normal = direction.Clone ().Normalize ();
		this.x += normal.x * distance;
		this.y += normal.y * distance;
		this.z += normal.z * distance;
		return this;
	}

	public Rotate(axis: Coord3D, angle: number, origo: Coord3D): Coord3D {
		let normal = axis.Clone ().Normalize ();

		let u = normal.x;
		let v = normal.y;
		let w = normal.z;

		let x = this.x - origo.x;
		let y = this.y - origo.y;
		let z = this.z - origo.z;

		let si = Math.sin (angle);
		let co = Math.cos (angle);
		this.x = - u * (- u * x - v * y - w * z) * (1.0 - co) + x * co + (- w * y + v * z) * si;
		this.y = - v * (- u * x - v * y - w * z) * (1.0 - co) + y * co + (w * x - u * z) * si;
		this.z = - w * (- u * x - v * y - w * z) * (1.0 - co) + z * co + (- v * x + u * y) * si;

		this.x += origo.x;
		this.y += origo.y;
		this.z += origo.z;
		return this;
	}

	public Clone(): Coord3D {
		return new Coord3D (this.x, this.y, this.z);
	}

    public Sub(val: Coord3D): Coord3D {
        this.x -= val.x;
        this.y -= val.y;
        this.z -= val.z;
        return this;
    }

    public IsEqual(val: Coord3D): boolean {
        return GeomUtils.IsEqual (this.x, val.x) 
            && GeomUtils.IsEqual (this.y, val.y) 
            && GeomUtils.IsEqual (this.z, val.z);
    }

    public Add(val: Coord3D): Coord3D {
        this.x += val.x;
        this.y += val.y;
        this.z += val.z;
        return this;
    }

    public Distance(val: Coord3D): number {
        return Math.sqrt(
            (this.x - val.x) * (this.x - val.x) + 
            (this.y - val.y) * (this.y - val.y) + 
            (this.z - val.z) * (this.z - val.z));
    }

    public Dot(val: Coord3D): number {
        return this.x * val.x + this.y * val.y + this.z * val.z;
    }

    public VectorAngle3D(val: Coord3D): number {
        let aDirection = this.Clone().Normalize();
        let bDirection = val.Clone().Normalize();
        if (aDirection.IsEqual(bDirection)) {
            return 0.0;
        }
        let product = aDirection.Dot(bDirection);
        return Math.acos(product);
    }

    public CrossVector3D(val: Coord3D): Coord3D {
        const a = this.Clone();
        this.x = a.y * val.z - a.z * val.y;
        this.y = a.z * val.x - a.x * val.z;
        this.z = a.x * val.y - a.y * val.x;
        return this;
    }
}


// export function VectorLength3D (x, y, z)
// {
// 	return Math.sqrt(x * x + y * y + z * z);
// }

// export function ArrayToCoord3D(arr)
// {
// 	return new Coord3D (arr[0], arr[1], arr[2]);
// }
