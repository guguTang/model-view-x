export default class DataTransfer {
    constructor() {
        throw new Error('DataTransfer can not instance');
    }
    public static ArrayBuffer2Blob(data: ArrayBuffer): Blob {
        return new Blob([data], { type: 'application/octet-stream'});
    }

    public static String2Blob(data: string): Blob {
        return new Blob([data], { type: 'text/plain'});
    }

    public static ArrayBuffer2Text(data: ArrayBuffer, textEncode: string = 'utf-8'): string {
        const decoder = new TextDecoder(textEncode);
        return decoder.decode(data);
    }

    public static ArrayBuffer2Utf8String (data: ArrayBuffer): string {
        let decoder = new TextDecoder ('utf-8');
        return decoder.decode (data);
    }

    public static ArrayBuffer2AsciiString (data: ArrayBuffer): string {
        let text = '';
        let bufferView = new Uint8Array(data);
        for (let i = 0; i < bufferView.byteLength; i++) {
            text += String.fromCharCode (bufferView[i]);
        }
        return text;
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

    public static Utf8String2ArrayBuffer(str: string): ArrayBuffer {
        let encoder = new TextEncoder();
        let uint8Array = encoder.encode(str);
        return uint8Array.buffer;
    }

    public static AsciiString2ArrayBuffer(str: string): ArrayBuffer {
        let buffer = new ArrayBuffer(str.length);
        let bufferView = new Uint8Array(buffer);
        for (let i = 0; i < str.length; i++) {
            bufferView[i] = str.charCodeAt(i);
        }
        return buffer;
    }

    public static Base64DataURIToArrayBuffer(uri: string): ArrayBuffer | null {
        let dataPrefix = 'data:';
        if (!uri.startsWith (dataPrefix)) {
            return null;
        }

        let mimeSeparator = uri.indexOf(';');
        if (mimeSeparator === -1) {
            return null;
        }

        let bufferSeparator = uri.indexOf(',');
        if (bufferSeparator === -1) {
            return null;
        }

        // let mimeType = uri.substring (dataPrefix.length, dataPrefix.length + mimeSeparator - 5);
        let base64String = atob (uri.substring (bufferSeparator + 1));
        let buffer = new ArrayBuffer (base64String.length);
        let bufferView = new Uint8Array (buffer);
        for (let i = 0; i < base64String.length; i++) {
            bufferView[i] = base64String.charCodeAt (i);
        }
        return buffer;
        // return {
        //     mimeType : mimeType,
        //     buffer : buffer
        // };
    }
}