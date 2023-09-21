export default class DataTransfer {
    constructor() {
        throw new Error('DataTransfer can not instance');
    }
    public static ArrayBuffer2Blob(data: ArrayBuffer): Blob {
        return new Blob([data]);
    }

    public static ArrayBuffer2Text(data: ArrayBuffer, textEncode: string = 'utf-8'): string {
        const decoder = new TextDecoder(textEncode);
        return decoder.decode(data);
    }

    public static ArrayBuffer2Json(data: ArrayBuffer, textEncode: string = 'utf-8'): any {
        let rv: any = null;
        try {
            const text = DataTransfer.ArrayBuffer2Text(data, textEncode);
            rv = JSON.parse(text);
        } catch {

        }
        return rv;
    }
}