import React, { useState, useEffect } from "react";

// Helper to resolve IPFS URIs
const resolveIpfsUri = (uri) => {
  if (!uri) {
    console.error("Invalid URI:", uri);
    return null;
  }
  return uri.startsWith("ipfs://")
    ? `https://dweb.link/ipfs/${uri.slice(7)}`
    : uri;
};

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

  // Shuffle the playlist and filter out inactive songs when it updates
  useEffect(() => {
    if (playlist?.length > 0) {
      console.log("Shuffling and filtering active playlist:", playlist); // Debugging
      const activeSongs = playlist.filter((song) => song?.isActive !== false); // Check for active songs
      const shuffled = shuffleArray(activeSongs);
      setShuffledPlaylist(shuffled);
    } else {
      console.log("Empty or invalid playlist prop."); // Debugging
      setShuffledPlaylist([]);
    }
  }, [playlist]);
  

  return (
    <div>
      <h2>Playlist</h2>
      {shuffledPlaylist.length === 0 ? (
        <p>No audios available yet.</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {shuffledPlaylist.map((song) => (
            <li key={song.id} style={{ marginBottom: "10px" }}>
              <strong>{song.title || "Untitled"}</strong> -{" "}
              <a
                href={resolveIpfsUri(song.uri)}
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
