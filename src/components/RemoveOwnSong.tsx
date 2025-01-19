import React, { useEffect } from "react";
import SavedAudio from "./SavedAudio";
import { useWeb3Radio } from "../context/Web3RadioContext";
import { usePopup } from "../context/PopupContext";

// Is for testing purposes (altering contract getMySaves function)

interface RemoveOwnSongProps {

}

const RemoveOwnSong: React.FC<RemoveOwnSongProps> = () => {
  const { playlistContract:contract, fetchUserSongs, mySongs } = useWeb3Radio();
  const { openPopup } = usePopup();
  useEffect(() => {
    if (contract) {
      console.log("Contract detected in RemoveOwnSong. Fetching user songs...");
      fetchUserSongs();
    } else {
      console.error("Contract not initialized in RemoveOwnSong.");
    }
  }, [contract, fetchUserSongs]);

  const removeSong = async (songId:any) => {
    if (!contract) {
      alert("Smart contract not initialized.");
      return;
    }

    openPopup('Removing...', `Removing song with ID: ${songId}`, 'loading');

    try {
      console.log(`Removing song with ID: ${songId}`); // Debugging
      const tx = await contract.removeOwnSong(songId);
      await tx.wait();
      openPopup('Removed!', `Song "${songId}" removed successfully!`, 'success');
      fetchUserSongs(); // Refresh the song list
    } catch (error) {
      console.error("Error removing song:", error);
      openPopup('Error', `Failed to remove the song. Error: ${error}`, 'error');
    }
  };

  console.log("Rendered mySongs in RemoveOwnSong:", mySongs); // Debugging

  return (
    <div className="w-full bg-transparent p-6">
      <h2 className="text-black text-3xl font-black uppercase mb-12">Your Submitted Audios</h2>
      {mySongs && mySongs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {mySongs.map((song:any) => <SavedAudio handleDelete={removeSong} key={song.id} {...song} />)}
        </div>
      ) : (
        <p>No audios found in your submissions.</p>
      )}
    </div>
  );
};

export default RemoveOwnSong;


{/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {mySongs.map((song) => <SavedAudio key={song.id} {...song} />)}
        </div> */}