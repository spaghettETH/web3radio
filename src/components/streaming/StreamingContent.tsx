import React, { useRef } from "react";
import { Song, LiveStreamPlatform } from "../../interfaces/interface";
import { resolveCloudLinkUrl, resolveStreamingLink } from "../../utils/Utils";
import AudioPlayer from 'react-h5-audio-player';
import ReactHlsPlayer from 'react-hls-player';
interface StreamingContentProps {
    liveSong: Song;
    liveStreamPlatform: LiveStreamPlatform;
}

const StreamingContent = ({ liveSong, liveStreamPlatform }: StreamingContentProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
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
                liveStreamPlatform == LiveStreamPlatform.TWITCH &&
                <iframe
                    src={resolveStreamingLink(liveSong.uri)}
                    height="315"
                    width="100%"
                >
                </iframe>
            }
            {
                liveStreamPlatform == LiveStreamPlatform.HLS &&
                <>
                    <video className="invisible h-0 w-0" ref={videoRef} src={liveSong.uri} autoPlay={false} controls={true} />
                    {videoRef && videoRef.current && <ReactHlsPlayer
                        src={liveSong.uri}
                        autoPlay={false}
                        controls={true}
                        width="100%"
                        height="auto"
                        playerRef={videoRef as React.RefObject<HTMLVideoElement>}
                    />}
                </>
            }
            {
                (liveStreamPlatform == LiveStreamPlatform.RADIO || liveStreamPlatform == LiveStreamPlatform.NOT_SPECIFIED) &&
                <div className="bg-black">
                    {
                        liveSong.img && (
                            <img
                                src={resolveCloudLinkUrl(liveSong.img, 'img')}
                                alt={`${liveSong.title} Cover`}
                                className="w-full h-[500px] object-contain"
                            />
                        )
                    }
                    <AudioPlayer
                        autoPlay={true}
                        src={liveSong.uri}
                        style={{
                            backgroundColor: 'black',
                            color: 'white',
                            border: 'none',
                            boxShadow: 'none',
                        }}
                        showSkipControls={process.env.REACT_APP_AUDIO_CONTROLS == 'ON'}
                        showJumpControls={process.env.REACT_APP_AUDIO_CONTROLS == 'ON'}
                        showFilledProgress={process.env.REACT_APP_AUDIO_CONTROLS == 'ON'}
                        showFilledVolume={process.env.REACT_APP_AUDIO_CONTROLS == 'ON'}
                        showDownloadProgress={false}
                        customProgressBarSection={[]}
                        customAdditionalControls={[]}
                    />

                </div>
            }
        </div>
    )
}

export default StreamingContent;