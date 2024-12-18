import React, { useState, useEffect } from "react";

const MySaves = ({ contract, currentSong }) => {
  const [savedSongs, setSavedSongs] = useState([]);

  // Fetch user's saved songs from the smart contract
  const fetchMySaves = async () => {
    if (contract) {
      try {
        console.log("Fetching saved songs...");
        const mySaves = await contract.retrieveMySaves();
        const formattedSaves = mySaves.map((song) => ({
          id: song.id,
          title: song.title,
          uri: song.uri,
        }));
        setSavedSongs(formattedSaves);
      } catch (error) {
        console.error("Error fetching saved songs:", error);
      }
    }
  };

  // Save the currently playing song to the user's saves
  const handleSaveSong = async () => {
    if (currentSong && currentSong.id && contract) {
      try {
        console.log(`Saving song: ${currentSong.title}`);
        const tx = await contract.addToMySaves(currentSong.id);
        await tx.wait();

        alert(`Song "${currentSong.title}" saved successfully!`);
        fetchMySaves(); // Refresh the saved songs list after saving
      } catch (error) {
        console.error("Error saving the song:", error);
        alert("Failed to save the song. Ensure you're connected and authorized.");
      }
    } else {
      alert("No song is currently playing or the song data is incomplete.");
    }
  };

  useEffect(() => {
    fetchMySaves(); // Fetch saved songs when the contract updates
  }, [contract]);

  return (
    <div>
      <h2>My Saved Audios</h2>
      <button
        onClick={handleSaveSong}
        disabled={!currentSong || !currentSong.id}
        style={{ marginBottom: "10px" }}
      >
        Save Current Audio
      </button>
      {savedSongs.length > 0 ? (
        <ul>
          {savedSongs.map((song) => (
            <li key={song.id}>
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
      ) : (
        <p>You have no saved audios yet.</p>
      )}
    </div>
  );
};

export default MySaves;
