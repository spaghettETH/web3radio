
// Helper to resolve IPFS URIs
const resolveIpfsUri = (uri:string) => {
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

const sanitizeUri = (uri: string) => {
    if (!uri) {
        console.error("Invalid URI:", uri);
        return undefined;
    }
    
    if(uri.includes("dropbox.com")){
        return uri.replace("dropbox.com", "dl.dropboxusercontent.com");
    }
    return uri;
};

export { resolveIpfsUri, sanitizeUri };