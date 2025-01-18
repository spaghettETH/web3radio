import React, { useState, useEffect, useRef } from "react";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { sanitizeUri } from "../utils/Utils";
import { useWeb3Radio } from "../context/Web3RadioContext";
// Helper to resolve IPFS URIs
const resolveIpfsUri = (uri) => {
  if (!uri) {
    console.error("Invalid URI:", uri);
    return null;
  }
  const resolveUrl = uri.startsWith("ipfs://") ? `https://dweb.link/ipfs/${uri.slice(7)}` : uri;
  console.log("resolveUrl", resolveUrl);
  return resolveUrl
};

const Web3AudioPlayer = ({ setSong  }) => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledPlaylist, setShuffledPlaylist] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const { playlist } = useWeb3Radio();

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
    }
    return shuffled;
  };

  useEffect(() => {
    //Playlist
    if (playlist.length > 0) {
      const shuffledPlaylist = shuffleArray(playlist);
      setShuffledPlaylist(shuffledPlaylist);
      setCurrentSong(shuffledPlaylist[0]);
      setSong(shuffledPlaylist[0]);
      console.log("[playlist]Current Song", shuffledPlaylist[0]);
      setCurrentIndex(0);
    }
  }, [playlist]);

  // Update the current song when the index changes or playlist changes

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
      {currentSong && <p className="text-left w-full text-base">(Now Playing)</p>}
      <div className="flex flex-col border-2 border-black w-full rounded-lg">
        {currentSong ? (
          <div className="bg-black">
            {currentSong.img && (
              <img
                src={resolveIpfsUri(currentSong.img)}
                alt={`${currentSong.title} Cover`}
                className="w-full h-[500px] object-contain"
              />
            )}
            <div className="w-full relative">
              <div>
                {
                  currentSong?.uri && 
                  <AudioPlayer
                    autoPlay={true}
                    src={sanitizeUri(resolveIpfsUri(currentSong?.uri))}
                    style={{ backgroundColor: 'black', color: 'white', border: 'none', boxShadow: 'none', }}
                    showSkipControls={false}
                    onEnded={handleEnded}
                  />
                }
              </div>
            </div>
          </div>
        ) : (
          <p>No songs available in the playlist. Please add songs to get started.</p>
        )}
      </div>
    </div>
  );
};

export default Web3AudioPlayer;
