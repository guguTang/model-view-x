import { EnvironmentType, ILight } from "./info-struct.ts";

export declare interface RenderLightState {
    ambient: ILight,
    direct: ILight,
    point?: ILight,
    spot?: ILight,
}

export declare interface RenderState {
    environment: string;
    background: boolean;
    playbackSpeed: number;
    actionStates: object;
    wireframe: boolean;
    skeleton: boolean;
    grid: boolean;
    gridWithAxes: boolean;
    autoRotate: boolean;
    backgroundColor: string;
    environmentType: EnvironmentType,
    // axes
    minAxes: boolean;
    doubleSide: boolean;

    lights: RenderLightState;
}

export const DefaultRenderState: RenderState = {
    environment: 'Neutral',
    background: false,
    playbackSpeed: 1.0,
    actionStates: {},
    wireframe: false,
    skeleton: false,
    grid: false,
    gridWithAxes: true,
    autoRotate: false,
    backgroundColor: '#191919',
    environmentType: 'none',
    minAxes: true,
    doubleSide: false,
    lights: {
        ambient: {
            intensity: 0.3,
            color: '#FFFFFF',
            type: 'ambient',
        },
        direct: {
            intensity: Number((0.8 * Math.PI).toFixed(1)),//0.8 * Math.PI,
            color: '#FFFFFF',
            type: 'direct',
        }
    }
};