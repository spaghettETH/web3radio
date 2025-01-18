
// Helper to resolve IPFS URIs
const resolveIpfsUri = (uri: string) => {
    if (!uri) {
        console.error("Invalid URI:", uri);
        return undefined;
    }
    const resolveUrl = uri.startsWith("ipfs://") ? `https://dweb.link/ipfs/${uri.slice(7)}` : uri;
    console.log("resolveUrl", resolveUrl);
    return resolveUrl
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