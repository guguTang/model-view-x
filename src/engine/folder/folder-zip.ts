import Folder from './folder';
import { guessModelFileTypeWithFileName, ModelType } from './file';
import * as JSZip from 'jszip';
import DataTransfer from '@/engine/data/transfer';
import { fileTypeFromStream, fileTypeFromBuffer} from 'file-type';
export default class FolderZip extends Folder {
    private _origin: File;
    constructor(file: File) {
        super();
        this._rootFolder = '';
        this._origin = file;
    }

    protected SetRootFile(): void {
        const fileList =  Array.from(this._fileMap.values()).filter(it => it.modelType !== ModelType.NONE);
        if (fileList.length === 1) {
            this._rootFile = fileList[0];
        }
    }

    public async Init(): Promise<boolean> {
        const jsZip = new JSZip();
        const unzipped = await jsZip.loadAsync(this._origin).catch((e)=>{
            console.error(e);
        });
        if (!unzipped) {
            return false;
        }
   
        for (const curKey in unzipped.files) {
            const curFile = unzipped.files[curKey];
            const curPath = curFile.name;
            const curData: ArrayBuffer = await curFile.async('arraybuffer');
            const tmpPathArray = curPath.split('/');
            const curName = tmpPathArray[tmpPathArray.length - 1];
            const curModelType = guessModelFileTypeWithFileName(curName);
            // const curType = await fileTypeFromBuffer(curData);
            // console.log(curType);
            // const fileType = fileTypeFromBuffer(curData);
            // const response = await fetch('http://127.0.0.1:8080/test-data/gltf/1/index.gltf');
            // const a = await curFile.async('blob');
            // a.stream
            // if (a.stream) {
                // const b = new FileReader();
                // b.readAsArrayBuffer(a);
                // const fileType = await fileTypeFromStream(response.body);
                // console.log(fileType);
            // }
            if (curFile.dir === false) {
                this.AddFile(curPath, {
                    path: curPath,
                    name: curName,
                    data: curData,
                    // @ts-ignore
                    size: curFile._data.uncompressedSize,
                    // type: curType?.mime || '',
                    modelType: curModelType,
                });
            }
        }
        this.SetRootFile();
        return true;
    }
}