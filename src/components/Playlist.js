import React, { useState, useEffect } from 'react';

// Fisher-Yates Shuffle Algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
  }
  return shuffled;
};

const Playlist = ({ playlist }) => {
  const [shuffledPlaylist, setShuffledPlaylist] = useState([]);

  // Shuffle the playlist only once when the component mounts
  useEffect(() => {
    if (playlist.length > 0) {
      const shuffled = shuffleArray(playlist);
      setShuffledPlaylist(shuffled);
    }
  }, [playlist]);

  return (
    <div>
      <h2>Playlist</h2>
      {shuffledPlaylist.length === 0 ? (
        <p>No audios available yet.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {shuffledPlaylist.map((song) => (
            <li key={song.id} style={{ marginBottom: '10px' }}>
              <strong>{song.title}</strong> -{" "}
              <a
                href={`https://cloudflare-ipfs.com/ipfs/${song.uri.replace("ipfs://", "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Listen
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Playlist;
