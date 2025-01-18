
// Helper to resolve IPFS URIs
const resolveIpfsUri = (uri) => {
    if (!uri) {
        console.error("Invalid URI:", uri);
        return null;
    }
    const resolveUrl = uri.startsWith("ipfs://") ? `https://dweb.link/ipfs/${uri.slice(7)}` : uri;
    console.log("resolveUrl", resolveUrl);
    return resolveUrl
};

const sanitizeUri = (uri) => {
    if (!uri) {
        console.error("Invalid URI:", uri);
        return null;
    }
    
    if(uri.includes("dropbox.com")){
        return uri.replace("dropbox.com", "dl.dropboxusercontent.com");
    }
    return uri;
};

export { resolveIpfsUri, sanitizeUri };