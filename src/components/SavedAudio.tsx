import React from "react";
import { resolveIpfsUri } from "../utils/Utils";

interface SavedAudioProps {
    id: any;
    title: string;
    uri: string;
    img: string;
    handleDelete: (id: any) => void;
}

const SavedAudio: React.FC<SavedAudioProps> = ({ id, title, uri, img, handleDelete }) => {

    const deleteSong = (id:any) => {
        if (handleDelete) {
            handleDelete(id);
        }
    }

    console.log("Img [no resolve]", img);
    console.log("Img [resolve]", resolveIpfsUri(img));
    return <div
        id={id}
        className="flex flex-col items-center justify-between rounded-md gap-4">

        <div className="w-full relative min-h-[200px] rounded-md overflow-hidden border-[1px] border-b-[5px] border-black shadow-lg">
            <img src={img ? resolveIpfsUri(img) : "/headphone.svg"} alt={title} className="w-full h-full object-cover" />
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
                <h1 className="text-black uppercase font-bold whitespace-nowrap group-hover:animate-scrollText inline-block">
                    {title}
                </h1>
            </div>
            <button onClick={() => deleteSong(id)}>
                <img src="/trash.svg" alt="trash" className="w-5 h-5" />
            </button>
        </div>
    </div>;
}

export default SavedAudio;