import React, { useState } from 'react';

const RadioModality = ({ onModalityChange }) => {

    const [isLive, setIsLive] = useState(true);
    const [isPlaylist, setIsPlaylist] = useState(false);

    const handleModalityChange = (modality) => {
        if (modality === "live") {
            setIsLive(true);
            setIsPlaylist(false);
        } else if (modality === "playlist") {
            setIsLive(false);
            setIsPlaylist(true);
        }

        if (onModalityChange) {
            onModalityChange(modality);
        }
    }

    return <div className="flex flex-row items-left my-2 justify-left gap-4 w-full">
        <button
            onClick={() => handleModalityChange("live")}
            className={`border-2 border-black text-white w-[150px] px-4 py-2 rounded-md ${
                isLive ? "bg-[#FF7AAD] text-black font-bold" : "bg-black"
            }`}>
            Live
        </button>
        <button
            onClick={() => handleModalityChange("playlist")}
            className={`border-2 border-black text-white w-[150px] px-4 py-2 rounded-md ${
                isPlaylist ? "bg-[#FF7AAD] text-black font-bold" : "bg-black"
            }`}>
            Playlist
        </button>
    </div>;
};

export default RadioModality;