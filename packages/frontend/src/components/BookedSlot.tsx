import React from "react";
import { usePopup } from "../context/PopupContext";
import { useWeb3Radio } from "../context/Web3RadioContext";
import { BlockChainOperationResult } from "../interfaces/interface";
import { resolveCloudLinkUrl } from "../utils/Utils";

interface BookedSlot {
    id: string;
    title: string;
    imageUrl: string;
    livestreamUrl: string;
    startTime: string;
    endTime: string;
}

interface BookedSlotProps {
    slot: BookedSlot;
    isCompact?: boolean;
    canDelete?: boolean;
}

const BookedSlot: React.FC<BookedSlotProps> = ({ slot, isCompact = false, canDelete = true }) => {

    const startTime = new Date(slot.startTime.replace(/(\d{2})\/(\d{2})\/(\d{4}),\s(\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6')).getTime();
    const endTime = new Date(slot.endTime.replace(/(\d{2})\/(\d{2})\/(\d{4}),\s(\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6')).getTime();
    const now = new Date().getTime();

    const isLive = startTime <= now && now <= endTime;
    const isFinished = endTime < now;

    const { deleteScheduledEvent } = useWeb3Radio();
    const { openPopup } = usePopup();

    const handleDelete = async (id: string) => {
        if(!slot || !slot.id){
            return;
        }
        try {
            openPopup({ title: "Delete Scheduled Event", message: "Are you sure you want to delete this scheduled event?", type: "loading" });
            const res = await deleteScheduledEvent(id);
            if (res === BlockChainOperationResult.SUCCESS) {
                openPopup({ title: "Success", message: "Scheduled event deleted successfully", type: "success" });
            } else if(res === BlockChainOperationResult.ERROR) {
                openPopup({ title: "Error", message: "Error deleting scheduled event", type: "error" });
            }
        } catch (error) {
            openPopup({ title: "Error", message: "Error deleting scheduled event", type: "error" });
            console.error("Error deleting scheduled event:", error);
        }
    }

    if (isCompact) {
        return (
            <div className="flex items-center justify-start border-2 border-gray-300 rounded-md p-2 m-2 gap-2">
                <div>
                    <img
                        className="w-[100px] rounded-md"
                        src={resolveCloudLinkUrl(slot.imageUrl, 'img')}
                        alt={slot.title + " image"}
                    />
                </div>
                <div className="flex flex-col items-start md:items-start">
                    <p>{slot.title}</p>
                    <p>{slot.startTime + " - " + slot.endTime}</p>
                    {canDelete && <button onClick={() => handleDelete(slot.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center md:flex-row md:justify-start border-2 border-gray-300 rounded-md p-2 m-2 gap-4">
            <div className="border-2 border-gray-300 rounded-md w-full md:w-1/4 ">
                <img
                    className="w-full rounded-md"
                    src={resolveCloudLinkUrl(slot.imageUrl, 'img')}
                    alt={slot.title + " image"}
                />
            </div>
            <div className="flex flex-col items-start md:items-start">
                <p>{"Title: " + slot.title}</p>
                <p>{"Start Time: " + slot.startTime}</p>
                <p>{"End Time: " + slot.endTime}</p>
                <p>{"Status: " + (isLive ? "Live" : isFinished ? "Finished" : "Scheduled")}</p>
                {canDelete && <button onClick={() => handleDelete(slot.id)}>Delete</button>}
            </div>
        </div>
    )
}

export default BookedSlot;