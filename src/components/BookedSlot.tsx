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
}

const BookedSlot: React.FC<BookedSlotProps> = ({ slot }) => {

    const startTime = new Date(slot.startTime.replace(/(\d{2})\/(\d{2})\/(\d{4}),\s(\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6')).getTime();
    const endTime = new Date(slot.endTime.replace(/(\d{2})\/(\d{2})\/(\d{4}),\s(\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6')).getTime();
    const now = new Date().getTime();

    const isLive = startTime <= now && now <= endTime;
    const isFinished = endTime < now;

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
            </div>
        </div>
    )
}

export default BookedSlot;