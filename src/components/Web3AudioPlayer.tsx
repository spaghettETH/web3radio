import React, { useState, useEffect, useRef } from "react";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useWeb3Radio } from "../context/Web3RadioContext";
import { resolveCloudLinkUrl, resolveIpfsUri, resolveStreamingLink } from "../utils/Utils";
import { RadioMode } from "../interfaces/interface";
import StreamingContent from "./streaming/StreamingContent";

interface Web3AudioPlayerProps {
  setSong: (song: any) => void;
}

const Web3AudioPlayer: React.FC<Web3AudioPlayerProps> = ({ setSong }) => {

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const { playlist, liveStreamPlatform, radioModality } = useWeb3Radio();

  const shuffleArray = (array: any) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
    }
    return shuffled;
  };

  useEffect(() => {
    //Working for playlist and live stream content
    if (playlist.length > 0) {
      const shuffledPlaylist = shuffleArray(playlist);
      setShuffledPlaylist(shuffledPlaylist);
      setCurrentSong(shuffledPlaylist[0]);
      setSong(shuffledPlaylist[0]);
      setCurrentIndex(0);
    }
  }, [playlist]);

  // Handle song completion
  const handleEnded = () => {
    console.log("[handleEnded]Current Index", currentIndex);
    const maxIndexOfPlaylist = shuffledPlaylist.length - 1;
    if (currentIndex < maxIndexOfPlaylist) {
      setCurrentIndex(currentIndex + 1);
      setCurrentSong(shuffledPlaylist[currentIndex + 1]);
    } else {
      setCurrentIndex(0);
      setCurrentSong(shuffledPlaylist[0]);
    }
  };

  return (
    <div className="w-full relative">
      {/* Audio Mode */}
      {currentSong && <p className="text-left w-full text-base">{radioModality == RadioMode.PLAYLIST ? "Playlist " : `[${liveStreamPlatform.toUpperCase()}] Live`}</p>}
      <div className="flex flex-col border-2 border-black w-full rounded-lg">

        {/* CASE: Live Stream */}
        {
          currentSong && radioModality == RadioMode.LIVE &&
          <p className="text-left w-full text-base">
            <StreamingContent
              liveSong={currentSong}
              liveStreamPlatform={liveStreamPlatform} />
          </p>
        }
        {
          !currentSong && radioModality == RadioMode.LIVE &&
          <p>No live stream available. Please check back later.</p>
        }
        {/* END CASE: Live Stream */}


        {/* CASE: Playlist */}
        {
          currentSong && radioModality == RadioMode.PLAYLIST &&
          <div className="bg-black">
            {
              currentSong.img && (
                <img
                  src={resolveCloudLinkUrl(currentSong.img, 'img')}
                  alt={`${currentSong.title} Cover`}
                  className="w-full h-[500px] object-contain"
                />
              )
            }
            <div className="w-full relative">
              <div>
                {
                  <AudioPlayer
                    autoPlay={true}
                    src={resolveCloudLinkUrl(currentSong?.uri, 'audio')}
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
                    onEnded={handleEnded}
                  />
                }
              </div>
            </div>
          </div>
        }
        {
          !currentSong && radioModality == RadioMode.PLAYLIST &&
          <p>No songs available in the playlist. Please add songs to get started.</p>
        }
        {/* END CASE: Playlist */}
      </div>

    </div>
  );
};

export default Web3AudioPlayer;
