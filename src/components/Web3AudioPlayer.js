import React, { useState, useEffect, useRef } from "react";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

// Helper to resolve IPFS URIs
const resolveIpfsUri = (uri) => {
  if (!uri) {
    console.error("Invalid URI:", uri);
    return null;
  }
  const resolveUrl = uri.startsWith("ipfs://") ? `https://dweb.link/ipfs/${uri.slice(7)}` : uri;
  return resolveUrl
};

const Web3AudioPlayer = ({ playlist, setCurrentSong }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update the current song when the index changes or playlist changes
  useEffect(() => {
    if (playlist.length > 0) {
      // Validate currentIndex or default to the first song in the shuffled playlist
      const validIndex = currentIndex < playlist.length ? currentIndex : 0;
      setCurrentIndex(validIndex);
      console.log("Setting current song:", playlist[validIndex]); // Debugging
      setCurrentSong(playlist[validIndex]);
    }
  }, [currentIndex, playlist, setCurrentSong]);

  // Handle song completion
  const handleEnded = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  // Aggiungiamo questi due gestori
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? playlist.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % playlist.length
    );
  };

  // Get the current song or handle an empty playlist
  const currentSong = playlist[currentIndex] || null;

  return (
    <div className="w-full relative">
      {currentSong && <p className="text-left w-full text-base">(Now Playing)</p>}
      <div className="flex flex-col border-2 border-black w-full rounded-lg">
        {currentSong ? (
          <div className="bg-black">
            {currentSong.img && (
              <img
                src={resolveIpfsUri(currentSong.img)}
                //src="https://uc01920ebeca91e0ebdd6ecf9fa5.previews.dropboxusercontent.com/p/thumb/ACi2QT4zy1KjyRuDqqiGfGEBgot8ifffIdO0GDGS8imvjERoW1wKskxrvqlBM67aMTiVVpjaJngR7rS8nz2FJpLyXnKHjoaS9a-Pt94Lq-7m6PMaDMFkWODI1NhTckhdvc0BnYLVg1E9noo52Yo6jOJaxSjqdeOZ_F7znTfpMdZCqrCkAYmUyKVOqaw6APh-UWDeGtJjqfLGMZFhpB6QSWD4Coh5j0EweZ1NLMSiD0P1eRdDkGefDyjMyXc2qVlAYBPzK9TtfdRLiku8yrDZ9Gp2hrTUlbIM4330w6m1My_VoHV5mRsdEAxMZA7VqupyTG3JpriK_YrFm8xH4KsMfGvT7QQTM8mSTDqPqjbJvgNC6kF5UV0dbLaIAqBEhQAlEyU9x1cyGhM-QktscfekvypE/p.png"
                alt={`${currentSong.title} Cover`}
                className="w-full h-[500px] object-contain"
              />
            )}
            <div className="w-full relative">
              <div>
                <AudioPlayer
                  src={resolveIpfsUri(currentSong?.uri)}
                  style={{
                    backgroundColor: 'black',
                    color: 'white',
                    border: 'none',
                    boxShadow: 'none',
                  }}
                  onClickPrevious={handlePrevious}
                  onClickNext={handleNext}
                  onEnded={handleEnded}
                />
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
