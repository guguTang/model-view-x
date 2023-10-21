import BUS from './bus';

export { EventType } from './event-type';
export type { 
    IEventBandData, 
    IEventBandDataForSingleClickOnView3D,
} from './event-type';
export const GlobalBUS = new BUS();