import Folder from './folder';
import { guessModelFileTypeWithFileName, ModelType } from './file';
export default class FolderLocal extends Folder {
    private _fileList: FileList;
    constructor(fileList: FileList) {
        super();
        this._rootFolder = '';
        this._fileList = fileList;
    }

    protected SetRootFile(): void {
        const fileList =  Array.from(this._fileMap.values()).filter(it => it.modelType !== ModelType.NONE);
        if (fileList.length === 1) {
            this._rootFile = fileList[0];
        }
    }

    public async Init(): Promise<boolean> {
        for (const it of this._fileList) {
            let err = null;
            const buffer: ArrayBuffer | void = await it.arrayBuffer().catch((e) => {
                err = e;
            });
            if (err !== null || !buffer) {
                return false;
            }
            const modelType = guessModelFileTypeWithFileName(it.name);
            this.AddFile(it.name, {
                path: it.name,
                name: it.name,
                data: buffer,
                size: it.size,
                type: it.type,
                modelType: modelType,
            });
        }
        this.SetRootFile();
        return true;
    }
}