import { PlaybackEvent } from './AnalyticsEvents';
export interface AnalyticsOptions {
    metadata: {
        [key: string]: any;
    };
    handleOnPlayback: (event: PlaybackEvent) => void;
}
export declare const defaultOptions: AnalyticsOptions;
