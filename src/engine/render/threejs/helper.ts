import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import {
    WebGLRenderer,
    PMREMGenerator,
    Texture,
    DataTexture,
} from 'three';
import { EnvironmentType } from '../info-struct';
export class THREEHelper {
    private _renderer: WebGLRenderer;
    private _pmremGenerator: PMREMGenerator;
    private _environmentMap : Map<EnvironmentType, Texture>;
    constructor(renderer: WebGLRenderer) {
        this._environmentMap = new Map<EnvironmentType, Texture>;
        this._renderer = renderer;
        this._pmremGenerator = new PMREMGenerator(this._renderer);
        this._pmremGenerator.compileEquirectangularShader();

        this._environmentMap.set('room', this._pmremGenerator.fromScene(new RoomEnvironment()).texture);
        this._pmremGenerator.dispose();
    }

    public async GetEnvironment(type: EnvironmentType): Promise<Texture | undefined> {
        let envMap = this._environmentMap.get(type);
        if (!envMap) {
            envMap = await this.GetCubeMapTexture(type);
            if (envMap) {
                this._environmentMap.set(type, envMap);
            }
        }
        return envMap;
    }

    private GetCubeMapTexture(type: EnvironmentType): Promise<Texture | undefined> {
        let imgPath = '';
        switch (type) {
            case 'footprint-court': {
                imgPath = 'https://storage.googleapis.com/donmccurdy-static/footprint_court_2k.exr';
                break;
            }
            case 'venice-sunset': {
                imgPath = 'https://storage.googleapis.com/donmccurdy-static/venice_sunset_1k.exr';
                break;
            }
            default: {
                break;
            }
        }
        if (imgPath === '') {
            return Promise.resolve(undefined);
        }
        return new Promise<Texture | undefined>((resolve, reject) => {
            new EXRLoader().load(imgPath, (texture: DataTexture) => {
                const envMap = this._pmremGenerator.fromEquirectangular(texture).texture;
                this._pmremGenerator.dispose();
                resolve(envMap);
            }, undefined, reject);
        });
    }
}