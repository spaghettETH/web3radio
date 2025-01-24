import axios from "axios";
import { LiveStreamPlatform } from "../interfaces/interface";

// Helper to resolve IPFS URIs
const resolveIpfsUri = (uri: string) => {

    if (!uri) {
        console.error("Invalid URI:", uri);
        return undefined;
    }
    const resolvedUri = uri.startsWith("ipfs://")
        ? `https://dweb.link/ipfs/${uri.slice(7)}`
        : uri;

    //Convert G Drive link for audio
    if (resolvedUri.includes("drive.google.com")) {
        //Convert to example: https://drive.usercontent.google.com/download?id=13NVZTAls2Cx-1snX8_lH8ZJJ4-MVmbNW&export=view&authuser=0
        const fixUrl = resolvedUri.replace("&export=download", "");
        console.log("fixUrl", fixUrl);
        return fixUrl;
    }

    return resolvedUri;
};

const resolveCloudLinkUrl = (uri: string, type: 'img' | 'audio') => {
    try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        const getUrl = `${baseUrl}/resolve/cloude-storage-link?link=${uri}&type=${type}`;
        return getUrl;
    } catch (error) {
        console.error("Error resolving cloud link URL:", error);
        return type === 'img' ? "/img_placeholder.jpg" : "/mp3_placeholder.jpg";
    }
}

const sanitizeUri = (uri: string) => {
    if (!uri) {
        console.error("Invalid URI:", uri);
        return undefined;
    }

    if (uri.includes("dropbox.com")) {
        return uri.replace("dropbox.com", "dl.dropboxusercontent.com");
    }
    return uri;
};

const resolveStreamingLink = (uri: string) => {

    try {

        //YOUTUBE
        if (uri.includes("youtube")) {
            const url = new URL(uri);
            const videoId = url.searchParams.get("v") || url.pathname.split('/').pop();
            if (videoId) {
                const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                console.log("embedUrl", embedUrl);
                return embedUrl;
            }
        }

        //TWITCH
        if (uri.includes("twitch")) {
            const url = new URL(uri);
            const channel = url.searchParams.get("channel") || url.pathname.split('/')?.pop()?.replace("/", "");
            if (channel) {
                const embedUrl = `https://player.twitch.tv/?channel=${channel}&parent=${process.env.REACT_APP_BASE_URL}`;
                console.log("embedUrl", embedUrl);
                return embedUrl;
            }
        }

        return uri;
    } catch (error) {
        console.error("Error parsing YouTube URL:", error);
        return uri;
    }

}

const getLivePlatformFromUri = (uri: string) => {
    if (uri.includes("youtube")) {
        return LiveStreamPlatform.YOUTUBE;
    }
    if (uri.includes("twitch")) {
        return LiveStreamPlatform.TWITCH;
    }
    return LiveStreamPlatform.OTHER;
}

export { resolveIpfsUri, sanitizeUri, resolveCloudLinkUrl, getLivePlatformFromUri, resolveStreamingLink };