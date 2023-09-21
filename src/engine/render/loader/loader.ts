import Folder from '@/engine/folder/folder';
export declare interface LoaderOpts {
    url?: string;
    folder?: Folder;
    type: LoaderType;
    extra?: any;
};

export enum LoaderType {
    URL = 'url',
    Folder = 'folder',
};

export abstract class SceneLoader {
    protected _opts: LoaderOpts;
    constructor(opts: LoaderOpts) {
        this._opts = opts;
    }
    public abstract Load(): Promise<boolean>;
    public abstract LoadFromURL(url: string): Promise<boolean>;
    public abstract Clean(): void;
    public abstract get Scene(): any;
    public abstract get Clips(): any;
};