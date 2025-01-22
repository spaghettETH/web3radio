import React, { useState } from 'react';
import { useWeb3Radio } from "../context/Web3RadioContext";
import ScheduleLive from './ScheduleLive';

interface RadioModalityProps {
    onModalityChange: (modality: string) => void;
}

export enum Modality {
    LIVE = "live",
    PLAYLIST = "playlist"
}

const RadioModality: React.FC<RadioModalityProps> = ({ onModalityChange }) => {

    const [modalities, setModalities] = useState<Modality[]>([Modality.LIVE, Modality.PLAYLIST]);
    const [selectedModality, setSelectedModality] = useState<Modality>(Modality.PLAYLIST);

    const handleModalityChange = (modality: Modality) => {
        setSelectedModality(modality);
        onModalityChange(modality);
    }

    return <div className="flex flex-col items-left my-2 justify-left gap-4 w-full rounded-md">
        {
            <div className="flex flex-row items-center justify-start gap-4 text-white w-[150px] rounded-md">
                {
                    modalities.map((modality: Modality) => (
                        <div
                            onClick={() => handleModalityChange(modality)}
                            className={
                                `border-2 flex items-center justify-center border-black text-white w-[150px] px-4 py-2 rounded-md 
                        cursor-pointer
                        ${selectedModality === modality ? "bg-[#FF7AAD] text-black font-bold" : "bg-black"
                                }`}
                        >
                            {modality.toUpperCase()}
                        </div>
                    ))
                }
            </div>
        }
        {
            selectedModality === Modality.LIVE && (
                <ScheduleLive />
            )
        }
    </div>;
};

export default RadioModality;