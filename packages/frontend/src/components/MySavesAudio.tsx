import React, { useState, useEffect, useCallback, useMemo } from "react";
import SavedAudio from "./SavedAudio";
import { useWeb3Radio } from "../context/Web3RadioContext";
import { usePopup } from "../context/PopupContext";
import { BlockChainOperationResult, LiveStreamPlatform } from "../interfaces/interface";

interface MySavesProps { }

const MySavesAudio: React.FC<MySavesProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchMySaves, savedSongs, removeSavedSong, liveStreamPlatform, saveSongToMySaves, currentSong } = useWeb3Radio();
  const { openPopup, closePopup } = usePopup();

  const saveSongDisabled = useMemo(() => {
    const isSongAlreadySaved = currentSong && savedSongs.some((song) => song.id === currentSong.id);
    return !currentSong || !currentSong.id || liveStreamPlatform !== LiveStreamPlatform.NOT_SPECIFIED || isSongAlreadySaved;
  }, [currentSong, liveStreamPlatform, savedSongs]);

  // Save the currently playing song to the user's saves
  const handleSaveSong = async () => {
    console.log("[handleSaveSong] currentSong", currentSong);

    if (!currentSong || !currentSong.id) {
      openPopup({ title: 'Error', message: `No audio is currently playing or the audio data is incomplete.`, type: 'info' });
      return;
    }
    openPopup({ title: 'Saving...', message: `Saving audio: ${currentSong.title}`, type: 'loading' });
    try {
      console.log(`Saving audio: ${currentSong.title}`);
      console.log("[handleSaveSong] currentSong.id", currentSong.id);
      const res = await saveSongToMySaves(currentSong.id);
      if (res === BlockChainOperationResult.SUCCESS) {
        openPopup({ title: 'Saved!', message: `Audio "${currentSong.title}" saved successfully!`, type: 'success' });
        fetchMySaves(); // Refresh the saved songs list after saving
      } else if (res === BlockChainOperationResult.ERROR) {
        openPopup({ title: 'Error', message: `Failed to save the audio. Ensure you're connected and authorized.`, type: 'error' });
      }
    } catch (error) {
      console.error("Error saving the song:", error);
      openPopup({ title: 'Error', message: `Failed to save the audio. Ensure you're connected and authorized.`, type: 'error' });
    }
  };


  const handleDelete = async (id: any) => {
    try {
      openPopup({
        title: 'Deleting...',
        message: `Deleting saved audio: ${id}`,
        type: 'loading'
      });
      const res = await removeSavedSong(id);
      if (res === BlockChainOperationResult.SUCCESS) {
        openPopup({
          title: 'Deleted!',
          message: `Audio "${id}" deleted successfully!`,
          type: 'success'
        });
      } else if (res === BlockChainOperationResult.ERROR) {
        openPopup({
          title: 'Error',
          message: `Failed to delete the audio. Ensure you're connected and authorized.`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error("Error deleting the audio:", error);
      openPopup({
        title: 'Error',
        message: `Failed to delete the audio. Ensure you're connected and authorized.`,
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
        disabled={saveSongDisabled}
        className={`bg-black text-white px-4 py-2 rounded-md uppercase font-bold mt-4 mb-4 ${saveSongDisabled ? "opacity-50 cursor-not-allowed" : ""}`}>
        Save current audio
      </button>

    </div>
  );
};

export default MySavesAudio;
