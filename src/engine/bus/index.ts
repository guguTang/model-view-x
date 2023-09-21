import BUS from './bus';

export { EventType, ViewAuxiliaryType } from './event-type';
export type { 
    IEventBandData, 
    IEventBandDataForButton,
    IEventBandDataForSingleClickOnView3D,
} from './event-type';
export const GlobalBUS = new BUS();