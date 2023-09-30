export enum RenderType {
    THREEJS = 'threejs',
};

export declare interface RenderConfig {
    renderType: RenderType,
    // backgroundColor: string;

    // lights
    punctualLights: boolean;
    toneMapping: number;
    exposure: number;
    // directColor: string;
    // directIntensity: number;
    // ambientColor: string;
    // ambientIntensity: number;
};

export const DefaultRenderConfig: RenderConfig = {
    renderType: RenderType.THREEJS,
    // backgroundColor: '#191919',

    toneMapping: 1,
    exposure: 0.0,
    punctualLights: true,
    // directColor: '#FFFFFF',
    // directIntensity: 0.8 * Math.PI,
    // ambientColor: '#FFFFFF',
    // ambientIntensity: 0.3,
};