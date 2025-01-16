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

    const handleDelete = (id) => {
        console.log("Si deve cancellare il saved audio con id:", id);
    }


    return <div
        id={id}
        className="flex flex-col items-center justify-between rounded-md gap-4">

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

        <div className="w-full flex flex-row items-center justify-between gap-2">
            <div className="overflow-hidden relative flex-1 mr-2 group">
                <h1 className="text-black uppercase font-bold whitespace-nowrap md:group-hover:animate-none group-hover:animate-scrollText inline-block">
                    {title}
                </h1>
            </div>
            <button onClick={() => handleDelete(id)}>
                <img src="/trash.svg" alt="trash" className="w-5 h-5" />
            </button>
        </div>
    </div>;
}