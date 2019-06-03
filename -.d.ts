declare module "Events/AnalyticsEvents" {
    export interface PlaybackEvent {
        playerId: string;
        videoId: string;
        segmentStartSeconds: number;
        segmentEndSeconds: number;
        videoDurationSeconds: number;
        captureTime: Date;
    }
}
declare module "Events/AnalyticsOptions" {
    import { PlaybackEvent } from "Events/AnalyticsEvents";
    export interface AnalyticsOptions {
        metadata: {
            [key: string]: any;
        };
        handleOnPlayback: (event: PlaybackEvent) => void;
    }
    export const defaultOptions: AnalyticsOptions;
}
declare module "Wrapper/WrapperOptions" {
    type Controls = 'play-large' | 'play' | 'progress' | 'current-time' | 'mute' | 'volume' | 'captions' | 'fullscreen';
    export interface WrapperOptions {
        controls: Controls[];
    }
    export const defaultOptions: WrapperOptions;
}
declare module "BoclipsPlayer/BoclipsPlayerOptions" {
    import { AnalyticsOptions } from "Events/AnalyticsOptions";
    import { WrapperOptions } from "Wrapper/WrapperOptions";
    export interface BoclipsPlayerOptions {
        analytics: Partial<AnalyticsOptions>;
        player: Partial<WrapperOptions>;
    }
    export const defaultOptions: BoclipsPlayerOptions;
}
