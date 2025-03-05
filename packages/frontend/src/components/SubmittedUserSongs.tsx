import React, { useEffect } from "react";
import SavedAudio from "./SavedAudio";
import { useWeb3Radio } from "../context/Web3RadioContext";
import { usePopup } from "../context/PopupContext";
import { BlockChainOperationResult } from "../interfaces/interface";

// Is for testing purposes (altering contract getMySaves function)

interface SubmittedUserSongsProps {

}

const SubmittedUserSongs: React.FC<SubmittedUserSongsProps> = () => {
  const { playlistContract:contract, fetchUserSongs, mySongs, removeSubmittedUserSong } = useWeb3Radio();
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
    openPopup({
      title: 'Removing...',
      message: `Removing song with ID: ${songId}`,
      type: 'loading'
    });
    try {
      console.log(`Removing song with ID: ${songId}`); // Debugging
      const result = await removeSubmittedUserSong(songId);
      if(result === BlockChainOperationResult.SUCCESS) {
        openPopup({
          title: 'Removed!',
          message: `Song "${songId}" removed successfully!`,
          type: 'success'
        });
      } else if(result === BlockChainOperationResult.ERROR) {
        openPopup({
          title: 'Error',
          message: `Failed to remove the song.`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error("Error removing song:", error);
      openPopup({
        title: 'Error',
        message: `Failed to remove the song. Error: ${error}`,
        type: 'error'
      });
    }
  };

  console.log("Rendered mySongs in RemoveOwnSong:", mySongs); // Debugging

  return (
    <div className="w-full bg-transparent py-6">
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

export default SubmittedUserSongs;


{/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {mySongs.map((song) => <SavedAudio key={song.id} {...song} />)}
        </div> */}