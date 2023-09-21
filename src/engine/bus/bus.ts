import mitt from 'mitt';
import { Emitter } from 'mitt';
import { IEventBandData } from './event-type';
export default class BUS {
    private _mittIns: Emitter<any>;
    constructor() {
        this._mittIns = mitt();
    }

    public On(type: string, handler: any) {
        this._mittIns.on(type, handler);
    }

    public Off(type: string, handler: any) {
        this._mittIns.off(type, handler);
    }

    public Emit(type: string, event: IEventBandData | null) {
        this._mittIns.emit(type, event);
    }
}