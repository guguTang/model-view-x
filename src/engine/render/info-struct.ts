import {
    Vector3,
    Vector2,
} from 'three';

export type IVector3 = Vector3;
export type IVector2 = Vector2;

export type AnimationPlayMode = 'once' | 'reverse' | 'repeat' | 'pingpong';
export type EnvironmentType = 'none' | 'room' | 'footprint-court' | 'venice-sunset';

export type LightEnum = 'ambient' | 'direct';
export declare interface ILight {
    color: string;
    intensity: number;
    type: LightEnum,
}

export declare interface INodeEffectState {
    wireframe: boolean;
    normal: boolean;
    boundingbox: boolean;
    axes: boolean;
}

export declare interface INodeSimpleInfo {
    id: number;
    name: string;
    isMesh: boolean;
    isGroup: boolean;
    children: Array<INodeSimpleInfo>;
    vertices: number;
    triangles: number;
    boundingBox: IVector3;
    min?: IVector3;
    max?: IVector3;
    effectState: INodeEffectState;
}

export declare interface INodeGeomertySimpleInfo {
    vertices: number;
    triangles: number;
}