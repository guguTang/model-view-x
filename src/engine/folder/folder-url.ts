import Folder from './folder';
export default class FolderUrl extends Folder {
    constructor() {
        super();
    }

    protected SetRootFile(): void {

    }
    
    public async Init(): Promise<boolean> {
        return true;
    }
}