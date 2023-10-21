import DataTransfer from './transfer';

export class DataUtils {
    public static DownloadForArraybuffer(data: ArrayBuffer, name: string) {
        const filename = name;
        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.href = URL.createObjectURL(DataTransfer.ArrayBuffer2Blob(data));
        link.download = filename;
        link.click();
        document.body.removeChild(link);
    }
}