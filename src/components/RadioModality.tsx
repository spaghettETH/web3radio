import React, { useState } from 'react';
import { useWeb3Radio } from "../context/Web3RadioContext";

interface RadioModalityProps {
    onModalityChange: (modality: string) => void;
}

const RadioModality: React.FC<RadioModalityProps> = ({ onModalityChange }) => {

    const { radioModality } = useWeb3Radio();

    return <div className="flex flex-row items-left my-2 justify-left gap-4 w-full">
        <div
            className={`border-2 flex items-center justify-center border-black text-white w-[150px] px-4 py-2 rounded-md ${radioModality === "live" ? "bg-[#FF7AAD] text-black font-bold" : "bg-black" }`}>
            Live
        </div>
        <div
            className={`border-2 flex items-center justify-center border-black text-white w-[150px] px-4 py-2 rounded-md ${radioModality === "playlist" ? "bg-[#FF7AAD] text-black font-bold" : "bg-black"}`}>
            Playlist
        </div>
    </div>;
};

export default RadioModality;