export const EventType = {
    ButtonChange: 'button_change',
    ButtonChangeCallback: 'button_change_callback',
    ViewTreeModelNodeChange: 'view_tree_model_node_change',
    OpenFromUrl: 'open_from_url',
    OpenFromLocal: 'open_from_local',
    RendererStart: 'renderer_start',
    LoadSceneDone: 'load_scene_ok',
    SingleClickOnView3D: 'single_click_on_view3d',
};

export const ViewAuxiliaryType = {
    ShowCoordinates: 'coordinates',
    AutoRotate: 'auto-rotate',
    ShowWireframe: 'wireframe',
    ShowBoundBox: 'boundbox',
};

// export const CommonButtonType = {
//     OpenFromURL: 'open-from-url',
// };

export declare interface IEventBandData {
    id: string;
    name: string;
    value?: any;
};

export declare interface IEventBandDataForButton extends IEventBandData {
    selected: boolean
};

export declare interface IEventBandDataForSingleClickOnView3D extends IEventBandData {
    objectID: number | null;
};