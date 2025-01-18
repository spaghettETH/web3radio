import React, { useEffect } from "react";
import SavedAudio from "./SavedAudio";
import { useWeb3Radio } from "../context/Web3RadioContext";

// Is for testing purposes (altering contract getMySaves function)


const RemoveOwnSong = () => {
  const { playlistContract:contract, fetchUserSongs, mySongs } = useWeb3Radio();

  useEffect(() => {
    if (contract) {
      console.log("Contract detected in RemoveOwnSong. Fetching user songs...");
      fetchUserSongs();
    } else {
      console.error("Contract not initialized in RemoveOwnSong.");
    }
  }, [contract, fetchUserSongs]);

  const removeSong = async (songId) => {
    if (!contract) {
      alert("Smart contract not initialized.");
      return;
    }

    try {
      console.log(`Removing song with ID: ${songId}`); // Debugging
      const tx = await contract.removeOwnSong(songId);
      await tx.wait();
      alert("Song removed successfully!");
      fetchUserSongs(); // Refresh the song list
    } catch (error) {
      console.error("Error removing song:", error);
      alert(`Failed to remove the song. Error: ${error.message}`);
    }
  };

  console.log("Rendered mySongs in RemoveOwnSong:", mySongs); // Debugging

  return (
    <div className="w-full bg-transparent p-6">
      <h2 className="text-black text-3xl font-black uppercase mb-12">Your Submitted Audios</h2>
      {mySongs && mySongs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {mySongs.map((song) => <SavedAudio handleDelete={removeSong} key={song.id} {...song} />)}
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