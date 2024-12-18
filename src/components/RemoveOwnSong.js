import React, { useEffect } from 'react';

const RemoveOwnSong = ({ contract, mySongs, fetchUserSongs }) => {
  useEffect(() => {
    if (contract) {
      fetchUserSongs();
    }
  }, [contract, fetchUserSongs]);

  const removeSong = async (songId) => {
    try {
      const tx = await contract.removeOwnSong(songId);
      await tx.wait();
      alert(`Song removed successfully!`);
      fetchUserSongs(); // Refresh song list
    } catch (error) {
      console.error("Error removing song:", error);
      alert("Failed to remove the song.");
    }
  };

  return (
    <div>
      <h2>Your Submitted Audios</h2>
      {mySongs && mySongs.length > 0 ? (
        <ul>
          {mySongs.map((song) => (
            <li key={song.id}>
              <strong>{song.title}</strong> - {song.uri}
              <button onClick={() => removeSong(song.id)}>Remove Audio</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have not submitted any audio yet.</p>
      )}
    </div>
  );
};

export default RemoveOwnSong;
