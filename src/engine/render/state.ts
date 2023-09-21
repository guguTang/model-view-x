export declare interface RenderState {
    environment: string;
    background: boolean;
    playbackSpeed: number;
    actionStates: object;
    wireframe: boolean;
    skeleton: boolean;
    grid: boolean;
    autoRotate: boolean;
    // axes
    minAxes: boolean;
    doubleSide: boolean;
}

export const DefaultRenderState: RenderState = {
    environment: 'Neutral',
    background: false,
    playbackSpeed: 1.0,
    actionStates: {},
    wireframe: false,
    skeleton: false,
    grid: false,
    autoRotate: false,
    minAxes: true,
    doubleSide: false,
};