import { IFile } from './file';
import DataTransfer from '@/engine/data/transfer';
export default abstract class Folder {
    protected _fileMap: Map<string, IFile>;
    protected _rootFolder: string;
    protected _rootFile: IFile | null = null;
    constructor() {
        this._rootFolder = '';
        this._fileMap = new Map<string, IFile>();
    }

    public abstract Init(): Promise<boolean>;
    protected abstract SetRootFile(): void;

    public get rootFile(): IFile | null{
        return this._rootFile;
    }

    public get rootFolder(): string {
        return this._rootFolder;
    }

    // protected set rootFile(filePath: string) {
    //     this._rootFile = filePath;
    // }

    public Verify(): boolean {
        if (this._fileMap.size === 0) {
            return false;
        }
        if (!this._rootFile) {
            return false;
        }
        // if (this._rootFileModelType === ModelType.NONE) {
        //     return false;
        // }
        // if (this._rootFile === '') {
        //     return false;
        // }
        return true;
    }

    public AddFile(filePath: string, data: IFile, cover: boolean = false): boolean {
        if (this._fileMap.has(filePath) && cover === true) {
            return false;
        }
        this._fileMap.set(filePath, data);
        return true;
    }

    public GetFile(filePath: string, fuzzy: boolean = true): IFile | null {
        if (fuzzy !== true) {
            return this._fileMap.get(filePath) || null;
        } else {
            filePath = filePath.replace(/\/\//g, '/').replace(/\\\\/g, '/').replace(/\\/g, '/');
            return this._fileMap.get(filePath) || null;
        }
    }

    public GetFileAsText(filePath: string): string {
        const fileInfo = this.GetFile(filePath);
        if (fileInfo) {
            return DataTransfer.ArrayBuffer2Text(fileInfo.data);
        }
        return '';
    }

    public GetFileAsBlob(filePath: string): Blob {
        const fileInfo = this.GetFile(filePath);
        if (fileInfo) {
            return DataTransfer.ArrayBuffer2Blob(fileInfo.data);
        }
        return new Blob();
    }
};