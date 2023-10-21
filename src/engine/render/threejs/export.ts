import { AnimationClip, Object3D } from 'three';
import { STLExporter, STLExporterOptions } from 'three/examples/jsm/exporters/STLExporter';
import { GLTFExporter, GLTFExporterOptions } from 'three/examples/jsm/exporters/GLTFExporter';
// import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';
export abstract class THREEExporterBase {
    protected _isBinary: boolean;
    protected _animationClips: Array<AnimationClip> = [];
    protected _withAnimation: boolean;
    constructor() {
        this._isBinary = false;
        this._withAnimation = false;
    }

    public set binary(val: boolean) {
        this._isBinary = val;
    }

    public set withAnimation(val: boolean) {
        this._withAnimation = val;
    }

    public set animationClips(val: Array<AnimationClip>) {
        this._animationClips = val;
    }

    protected saveAsBlob(data: any): Blob {
        if(this._isBinary) {
            return new Blob([data], { type: 'application/octet-stream'});
        }
        return new Blob([data], { type: 'text/plain'});
    }

    public abstract Export(obj: Object3D): Promise<Blob | null>;
};

export class THREEExporterGLTF extends THREEExporterBase {
    private _exporter: GLTFExporter;
    constructor() {
        super();
        this._exporter = new GLTFExporter();
    }

    public Export(obj: Object3D): Promise<Blob | null> {
        let options: GLTFExporterOptions = {
            binary: this._isBinary,
            trs: false,
            onlyVisible: false,
            embedImages: true,
            includeCustomExtensions: true,
        };
        if (this._withAnimation) {
            options.animations = this._animationClips;
        }
        return new Promise<Blob | null>((resolve) => {
            this._exporter.parse(obj, (result) => {
                let data: any = result;
                if(result instanceof ArrayBuffer) {
                    
                } else {
                    data = JSON.stringify(result, null, 2);
                }
                resolve(this.saveAsBlob(data));
            }, (err) => {
                console.error(err);
                resolve(null);
            }, options);
        });
    }
}

export class THREEExporterSTL extends THREEExporterBase {
    private _exporter: STLExporter;
    constructor() {
        super();
        this._exporter = new STLExporter();
    }

    public Export(obj: Object3D): Promise<Blob | null> {
        let options: STLExporterOptions = {
            binary: this._isBinary,
        };
        const result = this._exporter.parse(obj, options);
        try {
            return Promise.resolve(this.saveAsBlob(result));
        } catch(e) {
            return Promise.resolve(null);
        }
    }
}