import React, { useState } from 'react';
import axios from 'axios';

const SubmitSongForm = ({ contract, fetchPlaylist }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Your Pinata API keys (replace with your own)
  const PINATA_API_KEY = '139e973f6c2a51531dc5';
  const PINATA_SECRET_API_KEY = '13a730d6457d587268607b43b7d227644af51e9fa95bdae1bf047a79b0a01fb4';

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      alert('Please provide both a title and a file');
      return;
    }

    setLoading(true);

    try {
      // Upload file to Pinata
      const ipfsUri = await uploadToPinata(file);
      
      // After the file is uploaded, submit the title and IPFS URI to the smart contract
      const tx = await contract.addSong(ipfsUri, title);
      await tx.wait();
      alert('Song submitted successfully!');
      fetchPlaylist(); // Refresh the playlist after submission
    } catch (error) {
      console.error('Error uploading or submitting song:', error);
      alert('Failed to upload the song or submit to the contract.');
    } finally {
      setLoading(false);
    }
  };

  // Function to upload the file to Pinata
  const uploadToPinata = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const data = new FormData();
    data.append('file', file);

    try {
      const response = await axios.post(url, data, {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY,
          'Content-Type': 'multipart/form-data',
        },
      });
      const ipfsHash = response.data.IpfsHash;
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      throw error;
    }
  };

  return (
    <div>
      <h2>Submit a New Song</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Song Title:</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Upload Song File:</label>
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept=".mp3,.wav,.ogg" 
            required 
          />
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Submit Song'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitSongForm;
