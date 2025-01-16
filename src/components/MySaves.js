import React, { useState, useEffect, useCallback } from "react";
import { getSavedSongsStubs } from "./Stubber";
import SavedAudio from "./SavedAudio";
// Is for testing purposes (altering contract getMySaves function)
const STUBBED = true;

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

const MySaves = ({ contract, currentSong }) => {
  const [savedSongs, setSavedSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's saved songs from the smart contract
  const fetchMySaves = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching saved song IDs...");
      const savedSongIds = await contract.retrieveMySaves();

      // Fetch details for each saved song
      const formattedSaves = await Promise.all(
        savedSongIds.map(async (id) => {
          const song = await contract.songsById(id);
          return {
            id: song.id.toString(),
            title: song.title,
            uri: song.uri,
            img: song.img,
            isActive: song.isActive, // Respect active status
          };
        })
      );

      //STUBB alter the contract getMySaves function and override the savedSongs for testing purposes
      if (STUBBED) {
        const stubbedSaves = await getSavedSongsStubs();
        setSavedSongs(stubbedSaves.filter((song) => song.isActive));
      } else {
        setSavedSongs(formattedSaves.filter((song) => song.isActive)); // Exclude inactive songs
      }
    } catch (error) {
      console.error("Error fetching saved songs:", error);
      setError("Failed to fetch saved songs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Save the currently playing song to the user's saves
  const handleSaveSong = async () => {
    if (!currentSong || !currentSong.id || !contract) {
      alert("No song is currently playing or the song data is incomplete.");
      return;
    }

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
  };

  // Fetch saved songs when the contract updates
  useEffect(() => {
    fetchMySaves();
  }, [fetchMySaves]);

  return (
    <div className="w-full bg-[#FF7AAD] p-6">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-black text-3xl font-black uppercase">My Saved Audios</h2>
        <img src="/eyes.svg" alt="eye" className="w-10 h-10" />
      </div>
      {loading ? (
        <p>Loading your saved audios...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : savedSongs.length > 0 ? (
        <ul>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {savedSongs.map((song) => (
              <SavedAudio key={song.id} {...song} />
            ))}
          </div>
        </ul>
      ) : (
        <p>You have no saved audios yet.</p>
      )}

      {
        savedSongs.length > 0 &&
        <button
          onClick={handleSaveSong}
          disabled={!currentSong || !currentSong.id}
          className={`bg-black text-white px-4 py-2 rounded-md uppercase font-bold mt-4 mb-4`}>
          Save current audio
        </button>
      }
    </div>
  );
};

export default MySaves;
