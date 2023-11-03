export class RGBColor {
    public r: number;
    public g: number;
    public b: number;
    constructor (r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    Set(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    Clone() {
        return new RGBColor (this.r, this.g, this.b);
    }
};

export class RGBAColor {
    public r: number;
    public g: number;
    public b: number;
    public a: number;
    constructor (r: number, g: number, b: number, a: number){
        // super(r, g ,b);
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    Set (r: number, g: number, b: number, a: number) {
        // super.Set(r, g, b);
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    Clone () {
        return new RGBAColor (this.r, this.g, this.b, this.a);
    }
};

export function ColorComponentFromFloat (component: number): number {
    return parseInt(Math.round(component * 255.0).toString(), 10);
}

export function ColorComponentToFloat (component: number) {
    return component / 255.0;
}

export function RGBColorFromFloatComponents (r: number, g: number, b: number) {
    return new RGBColor (
        ColorComponentFromFloat (r),
        ColorComponentFromFloat (g),
        ColorComponentFromFloat (b)
    );
}

export function SRGBToLinear (component: number) {
    if (component < 0.04045) {
        return component * 0.0773993808;
    } else {
        return Math.pow (component * 0.9478672986 + 0.0521327014, 2.4);
    }
}

export function LinearToSRGB (component: number) {
    if (component < 0.0031308) {
        return component * 12.92;
    } else {
        return 1.055 * (Math.pow (component, 0.41666)) - 0.055;
    }
}

export function IntegerToHexString (intVal: number) {
    let result = parseInt(intVal.toString(), 10).toString (16);
    while (result.length < 2) {
        result = '0' + result;
    }
    return result;
}

export function RGBColorToHexString (color: RGBColor, withPrefix: boolean = false): string {
    if (!color) {
        return '';
    }
    let r = IntegerToHexString (color.r);
    let g = IntegerToHexString (color.g);
    let b = IntegerToHexString (color.b);
    let rv: string = r + g + b;
    if (withPrefix === true) {
        rv = '#' + rv;
    }
    return rv;
}

export function RGBAColorToHexString (color: RGBAColor) {
    let r = IntegerToHexString (color.r);
    let g = IntegerToHexString (color.g);
    let b = IntegerToHexString (color.b);
    let a = IntegerToHexString (color.a);
    return r + g + b + a;
}

export function HexStringToRGBColor (hexString: string): RGBColor | null {
    if (hexString.length !== 6) {
        return null;
    }

    let r = parseInt (hexString.substring (0, 2), 16);
    let g = parseInt (hexString.substring (2, 4), 16);
    let b = parseInt (hexString.substring (4, 6), 16);
    return new RGBColor (r, g, b);
}

export function HexStringToRGBAColor (hexString: string): RGBAColor | null {
    if (hexString.length !== 6 && hexString.length !== 8) {
        return null;
    }

    let r = parseInt (hexString.substring (0, 2), 16);
    let g = parseInt (hexString.substring (2, 4), 16);
    let b = parseInt (hexString.substring (4, 6), 16);
    let a = 255;
    if (hexString.length === 8) {
        a = parseInt (hexString.substring (6, 8), 16);
    }
    return new RGBAColor(r, g, b, a);
}

export function ArrayToRGBColor (arr: Array<number>) {
	return new RGBColor (arr[0], arr[1], arr[2]);
}

export function RGBColorIsEqual (a: RGBAColor, b: RGBAColor) {
	return a.r === b.r && a.g === b.g && a.b === b.b;
}