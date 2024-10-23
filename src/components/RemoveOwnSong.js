import React, { useEffect } from 'react';

const RemoveOwnSong = ({ contract, mySongs, fetchUserSongs }) => {

  useEffect(() => {
    if (contract) {
      fetchUserSongs();  // Fetch user's songs when the component mounts or contract changes
    }
  }, [contract, fetchUserSongs]);

  const removeSong = async (index) => {
    try {
      const tx = await contract.removeOwnSong(index);
      await tx.wait();
      alert(`Song at index ${index} removed successfully!`);
      fetchUserSongs();  // Refresh the song list after removal
    } catch (error) {
      console.error("Error removing song:", error);
      alert("Failed to remove the song. Make sure you are authorized to remove it.");
    }
  };

  return (
    <div>
      <h2>Your Submitted Songs</h2>
      {mySongs.length > 0 ? (
        <ul>
          {mySongs.map((song, index) => (
            <li key={index}>
              <strong>{song.title}</strong> - {song.uri}
              <button onClick={() => removeSong(index)}>Remove Song</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have not submitted any songs yet.</p>
      )}
    </div>
  );
};

export default RemoveOwnSong;
