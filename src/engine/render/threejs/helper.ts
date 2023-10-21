import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import {
    WebGLRenderer,
    PMREMGenerator,
    Texture,
    DataTexture,
    Material,
    // MeshNormalMaterial,
    MeshPhongMaterial,
    Color,
    MeshPhysicalMaterial,
    MeshBasicMaterial,
    Vector3,
    PerspectiveCamera,
    CompressedTexture,
} from 'three';
import * as THREE from 'three';
import { EnvironmentType } from '../info-struct';
import * as TX from '@/engine/index';
import { MaterialPhysical } from '../../model/material/physical';
import { RGBColor, RGBColorFromFloatComponents } from '../../model/color';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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
                imgPath = 'resource/texture/footprint_court_2k.exr';
                break;
            }
            case 'venice-sunset': {
                imgPath = 'resource/texture/venice_sunset_1k.exr';
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

    public ConvertColorRGB(color: Color): RGBColor {
        return RGBColorFromFloatComponents(color.r, color.g, color.b);
    }

    public ConvertTexture(tex: Texture): TX.Texture {
        let rv = new TX.Texture();
        rv.name = tex.name;
        rv.offset = new TX.Coord2D(tex.offset.x, tex.offset.y);
        rv.scale = new TX.Coord2D(tex.repeat.x, tex.repeat.y);
        rv.rotation = tex.rotation;
        rv.mimeType = tex.userData['mimeType'] as string | '';
        if (tex.format === THREE.RGBAFormat && tex.image instanceof ImageBitmap) {
            rv.buffer = tex.image;
            rv.width = tex.image.width;
            rv.height = tex.image.height;
        } else if (tex instanceof CompressedTexture) {
            const compressedTex: CompressedTexture = tex as CompressedTexture;
            const firstMipmap = compressedTex.mipmaps[0];
            rv.buffer = firstMipmap.data;
            rv.width = firstMipmap.width;
            rv.height = firstMipmap.height;
            rv.addExtra('format', tex.format);
        }
        
        return rv;
    }

    public ConvertMaterial(originMaterial: Material): TX.MaterialFace {
        let rvMaterial: TX.MaterialFace | TX.MaterialPhong | TX.MaterialPhysical 
            = new TX.MaterialFace(TX.MaterialType.Basic, originMaterial.name);
        
        switch (originMaterial.type) {
            case 'MeshPhongMaterial':
            case 'MeshNormalMaterial': {
                const sourceMaterial: MeshPhongMaterial = originMaterial as MeshPhongMaterial;
                rvMaterial = new TX.MaterialPhong(originMaterial.name);
                const targetMaterial: TX.MaterialPhong = rvMaterial as TX.MaterialPhong;

                targetMaterial.shininess = sourceMaterial.shininess;
                targetMaterial.specular = this.ConvertColorRGB(sourceMaterial.specular);
                targetMaterial.emissive = this.ConvertColorRGB(sourceMaterial.emissive);
                targetMaterial.emissiveIntensity = sourceMaterial.emissiveIntensity;
                targetMaterial.aoMapIntensity = sourceMaterial.aoMapIntensity;
                
                
                if (sourceMaterial.bumpMap) targetMaterial.diffuseMap = this.ConvertTexture(sourceMaterial.bumpMap);
                if (sourceMaterial.normalMap) targetMaterial.normalMap = this.ConvertTexture(sourceMaterial.normalMap);
                if (sourceMaterial.emissiveMap) targetMaterial.emissiveMap = this.ConvertTexture(sourceMaterial.emissiveMap);
                if (sourceMaterial.aoMap) targetMaterial.aoMap = this.ConvertTexture(sourceMaterial.aoMap);

                if (sourceMaterial.specularMap) targetMaterial.specularMap = this.ConvertTexture(sourceMaterial.specularMap);
                break;
            }
            case 'MeshPhysicalMaterial':
            case 'MeshStandardMaterial': {
                const sourceMaterial: MeshPhysicalMaterial = originMaterial as MeshPhysicalMaterial;
                rvMaterial = new MaterialPhysical(originMaterial.name);
                const targetMaterial: TX.MaterialPhysical = rvMaterial as TX.MaterialPhysical;

                targetMaterial.metalness = sourceMaterial.metalness;
                targetMaterial.roughness = sourceMaterial.roughness;
                targetMaterial.emissive = this.ConvertColorRGB(sourceMaterial.emissive);
                targetMaterial.emissiveIntensity = sourceMaterial.emissiveIntensity;
                targetMaterial.aoMapIntensity = sourceMaterial.aoMapIntensity;

                if (sourceMaterial.bumpMap) targetMaterial.diffuseMap = this.ConvertTexture(sourceMaterial.bumpMap);
                if (sourceMaterial.normalMap) targetMaterial.normalMap = this.ConvertTexture(sourceMaterial.normalMap);
                if (sourceMaterial.emissiveMap) targetMaterial.emissiveMap = this.ConvertTexture(sourceMaterial.emissiveMap);
                if (sourceMaterial.aoMap) targetMaterial.aoMap = this.ConvertTexture(sourceMaterial.aoMap);

                if (sourceMaterial.roughnessMap) targetMaterial.roughnessMap = this.ConvertTexture(sourceMaterial.roughnessMap);
                if (sourceMaterial.metalnessMap) targetMaterial.metalnessMap = this.ConvertTexture(sourceMaterial.metalnessMap);
                break;
            }
            case 'MeshBasicMaterial': {
                break;
            }
            default: {
                break;
            }
        }
        const material: MeshBasicMaterial = originMaterial as MeshBasicMaterial;
        rvMaterial.color = this.ConvertColorRGB(material.color);
        rvMaterial.alphaTest = material.alphaTest;
        rvMaterial.opacity = material.opacity;
        rvMaterial.vertexColors = material.vertexColors;
        rvMaterial.transparent = material.transparent;
        if (material.map) rvMaterial.diffuseMap = this.ConvertTexture(material.map);
        
        return rvMaterial;
    }

    public Vec3ToCoord3(val: Vector3): TX.Coord3D {
        return new TX.Coord3D(val.x, val.y, val.z);
    }

    public Coord3ToVec3(val: TX.Coord3D): Vector3 {
        return new Vector3(val.x, val.y, val.z);
    }

    public ConvetCamera(origin: PerspectiveCamera, controls: OrbitControls): TX.Camera {
        const position = this.Vec3ToCoord3(origin.position);
        const target = this.Vec3ToCoord3(controls.target);
        const up = this.Vec3ToCoord3(origin.up);
        return new TX.Camera(position, target, up, origin.fov);
    }
}