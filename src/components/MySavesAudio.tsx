import React, { useState, useEffect, useCallback } from "react";
import SavedAudio from "./SavedAudio";
import { useWeb3Radio } from "../context/Web3RadioContext";
import { usePopup } from "../context/PopupContext";
import { LiveStreamPlatform } from "../interfaces/interface";
interface MySavesProps {
  currentSong: any;
}
const MySavesAudio: React.FC<MySavesProps> = ({ currentSong }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { playlistContract: contract, fetchMySaves, savedSongs, removeSavedSong, liveStreamPlatform } = useWeb3Radio();
  const { openPopup, closePopup } = usePopup();

  // Save the currently playing song to the user's saves
  const handleSaveSong = async () => {
    if (!currentSong || !currentSong.id || !contract) {
      alert("No song is currently playing or the song data is incomplete.");
      return;
    }
    openPopup({
      title: 'Saving...',
      message: `Saving song: ${currentSong.title}`,
      type: 'loading'
    });
    try {
      console.log(`Saving song: ${currentSong.title}`);
      const tx = await contract.addToMySaves(currentSong.id);
      await tx.wait();

      openPopup({
        title: 'Saved!',
        message: `Song "${currentSong.title}" saved successfully!`,
        type: 'success'
      });
      fetchMySaves(); // Refresh the saved songs list after saving
    } catch (error) {
      console.error("Error saving the song:", error);
      openPopup({
        title: 'Error',
        message: `Failed to save the song. Ensure you're connected and authorized.`,
        type: 'error'
      });
    }
  };

  const handleDelete = async (id: any) => {
    try {
      openPopup({
        title: 'Deleting...',
        message: `Deleting saved song: ${id}`,
        type: 'loading'
      });
      await removeSavedSong(id);
      openPopup({
        title: 'Deleted!',
        message: `Song "${id}" deleted successfully!`,
        type: 'success'
      });
    } catch (error) {
      console.error("Error deleting the song:", error);
      openPopup({
        title: 'Error',
        message: `Failed to delete the song. Ensure you're connected and authorized.`,
        type: 'error'
      });
    }
  };

  // Fetch saved songs when the contract updates
  useEffect(() => {
    fetchMySaves();
  }, [fetchMySaves]);

  return (
    <div className="w-full bg-[#FF7AAD] p-6">
      <div className="flex flex-row items-center justify-between mb-12">
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
              <SavedAudio key={song.id} {...song} handleDelete={handleDelete} />
            ))}
          </div>
        </ul>
      ) : (
        <p>You have no saved audios yet.</p>
      )}

      <button
        onClick={handleSaveSong}
        disabled={!currentSong || !currentSong.id || liveStreamPlatform != LiveStreamPlatform.NOT_SPECIFIED}
        className={`bg-black text-white px-4 py-2 rounded-md uppercase font-bold mt-4 mb-4 ${liveStreamPlatform != LiveStreamPlatform.NOT_SPECIFIED ? "opacity-50 cursor-not-allowed" : ""}`}>
        Save current audio
      </button>

    </div>
  );
};

export default MySavesAudio;
