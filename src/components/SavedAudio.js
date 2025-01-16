import React from "react";


export default function SavedAudio({ id, title, uri, img }) {

    const resolveIpfsUri = (uri) => {
        if (!uri) {
            console.error("Invalid URI:", uri);
            return null;
        }
        return uri.startsWith("ipfs://")
            ? `https://dweb.link/ipfs/${uri.slice(7)}`
            : uri;
    };


    return <div
        id={id}
        className="flex flex-col items-center justify-between rounded-md ">

        <div className="w-full relative h-full rounded-md overflow-hidden border-[1px] border-b-[5px] border-black shadow-lg">
            <img src={img} alt={title} className="w-full h-full" />
            <a
                href={resolveIpfsUri(uri)}
                target="_blank"
                className="absolute bottom-2 right-2 bg-[#32FFCF] border-2 border-black rounded-md p-2"
                rel="noopener noreferrer"
            >
                <img src="/play.svg" alt="play" className="w-4 h-4" />
            </a>
        </div>

        <div className="w-full flex flex-row items-center justify-between">
            <h1 className="text-black uppercase">{title}</h1>
            <img src="/trash.svg" alt="trash" className="w-10 h-10" />
        </div>
    </div>;
}