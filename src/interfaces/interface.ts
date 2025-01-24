

export enum RadioMode {
    LIVE = "live",
    PLAYLIST = "playlist",
}

export enum LiveStreamPlatform {
    YOUTUBE = "youtube",
    TWITCH = "twitch",
    OTHER = "other",
    NOT_SPECIFIED = "not_specified",
}

export type Song = {
    id: string;
    title: string;
    img: string;
    uri: string;
    submitter: string;
}