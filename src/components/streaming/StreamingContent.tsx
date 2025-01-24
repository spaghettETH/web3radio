import { Song, LiveStreamPlatform } from "../../interfaces/interface";
import { resolveStreamingLink } from "../../utils/Utils";

interface StreamingContentProps {
    liveSong: Song;
    liveStreamPlatform: LiveStreamPlatform;
}

const StreamingContent = ({ liveSong, liveStreamPlatform }: StreamingContentProps) => {
    return (
        <div className="w-full h-full">
            {
                liveStreamPlatform == LiveStreamPlatform.YOUTUBE &&
                <iframe width="100%" height="315"
                    src={resolveStreamingLink(liveSong.uri)}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
            }
            {
                (liveStreamPlatform == LiveStreamPlatform.OTHER || liveStreamPlatform == LiveStreamPlatform.NOT_SPECIFIED) &&
                <p>
                    {liveSong.title ? `[${liveStreamPlatform.toUpperCase()}] ${liveSong.title}` : "No live stream available. Please check back later."}
                </p>
            }
            {
                liveStreamPlatform == LiveStreamPlatform.TWITCH &&
                <iframe
                    src={resolveStreamingLink(liveSong.uri)}
                    height="315"
                    width="100%"
                >
                </iframe>
            }
        </div>
    )
}

export default StreamingContent;