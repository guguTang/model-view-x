export default abstract class ImporterBase {
    protected _error: boolean = false;
    protected _message: string | null = null;
    protected _extension: string = '';
    protected _name: string = '';
    constructor() {

    }

    public Import (name: string, extension: string, content: ArrayBuffer) {
        this.Clear ();

        this._name = name;
        this._extension = extension;
        // this.callbacks = callbacks;
        // this.model = new Model ();
        this._error = false;
        this._message = null;
        this.ResetContent();
        this.ImportContent(content);
        // this.ImportContent(content, () => {
        //     this.CreateResult(callbacks);
        // });
    }

    protected Clear() {
        this._error = false;
        this._message = null;
    }

    protected SetError(message: string) {
        this._error = true;
        if (message !== undefined && message !== null) {
            this._message = message;
        }
    }

    protected WasError(): boolean {
        return this._error;
    }

    public GetErrorMessage() {
        return this._message;
    }
    public abstract ImportContent(buffer: ArrayBuffer): boolean;

    public abstract ClearContent(): void;

    public abstract ResetContent(): void;
};