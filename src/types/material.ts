import * as TX from '@/engine/model/material/index';
export interface TextureWrapper {
    origin: TX.Texture;
    base64: string;
};

export interface MaterialUnion {
    // base
    type: TX.MaterialType;
    typeStr: string;
    name: string;
    baseColor: string;
    opacity: number;
    map?: TextureWrapper;
    normalMap?: TextureWrapper;
    emissiveColor?: string;
    emissiveMap?: TextureWrapper;
    emissiveIntensity?: number;
    aoMap?: TextureWrapper;
    aoMapIntensity?: number;
    // pbr
    metalness?: number;
    roughness?: number;
    metalnessMap?: TextureWrapper;
    roughnessMap?: TextureWrapper;

    // phong
    ambientColor?: string;
    specularColor?: string;
    shininess?: number;
    specularMap?: any;
}