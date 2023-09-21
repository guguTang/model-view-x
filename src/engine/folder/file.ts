export enum FileType {
    NONE = 'none',
    FBX = 'fbx',
    GLTF = 'gltf',
    OBJ = 'obj',
    STL = 'stl',
    DAE = 'dae',
};

export enum ModelType {
    NONE = 'none',
    FBX = 'fbx',
    GLTF = 'gltf',
    OBJ = 'obj',
    STL = 'stl',
    DAE = 'dae',
};

export declare interface IFile {
    path: string;
    name: string;
    data: ArrayBuffer;
    size: number;
    type?: string;
    modelType: ModelType;
}

export const guessModelFileTypeWithFileName = (fileName: string): ModelType => {
    const tmpArray = fileName.split('.');
    if (tmpArray.length < 2) {
        return ModelType.NONE;
    }
    const suffix = tmpArray[tmpArray.length - 1].toLowerCase();
    switch (suffix) {
        case 'gltf':
        case 'glb':
            return ModelType.GLTF;
        case 'fbx':
            return ModelType.FBX;
        case 'obj':
            return ModelType.OBJ;
        case 'stl':
            return ModelType.STL;
        case 'dae':
            return ModelType.DAE;
        default:
            return ModelType.NONE;
    }
}