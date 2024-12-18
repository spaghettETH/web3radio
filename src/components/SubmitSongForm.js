import React, { useState } from 'react';
import axios from 'axios';

const SubmitSongForm = ({ contract, fetchPlaylist, fetchUserSongs }) => {
  const [title, setTitle] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  // Pinata API keys
  const PINATA_API_KEY = '139e973f6c2a51531dc5';
  const PINATA_SECRET_API_KEY = '13a730d6457d587268607b43b7d227644af51e9fa95bdae1bf047a79b0a01fb4';

  // File change handlers with size checks
  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (file.size > 100 * 1024 * 1024) { // 100 MB limit
      alert("Audio file size must be 100MB or smaller.");
      return;
    }
    setAudioFile(file);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file.size > 1 * 1024 * 1024) { // 1 MB limit
      alert("Image file size must be 1MB or smaller.");
      return;
    }
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !audioFile || !imageFile || !disclaimerChecked) {
      alert('Please provide a title, audio file, image file, and check the disclaimer box.');
      return;
    }

    setLoading(true);

    try {
      // Upload audio and image files to Pinata
      const audioUri = await uploadToPinata(audioFile, "audio");
      const imageUri = await uploadToPinata(imageFile, "image");

      // Submit song with audio, image, and title to the smart contract
      const tx = await contract.addSong(audioUri, imageUri, title);
      await tx.wait();
      alert('Audio submitted successfully!');

      // Refresh playlists
      fetchPlaylist();
      fetchUserSongs();
    } catch (error) {
      console.error('Error uploading or submitting:', error);
      alert('Failed to upload files or submit to the smart contract.');
    } finally {
      setLoading(false);
    }
  };

  // Function to upload file to Pinata
  const uploadToPinata = async (file, type) => {
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
      console.log(`${type} file uploaded successfully: ipfs://${ipfsHash}`);
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      console.error(`Error uploading ${type} file to Pinata:`, error);
      throw error;
    }
  };

  return (
    <div>
      <h2>Submit a New Audio</h2>
      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <div>
          <label>Audio Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Audio File Input */}
        <div>
          <label>Upload Audio File (Max: 100MB):</label>
          <input
            type="file"
            accept=".mp3,.wav,.ogg"
            onChange={handleAudioFileChange}
            required
          />
        </div>

        {/* Image File Input */}
        <div>
          <label>Upload Cover Image (Max: 1MB):</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleImageFileChange}
            required
          />
        </div>

        {/* Disclaimer Checkbox */}
        <div>
          <label>
            <input
              type="checkbox"
              checked={disclaimerChecked}
              onChange={(e) => setDisclaimerChecked(e.target.checked)}
            />
            {' '}
            I own the © of this audio and I have read the{' '}
            <a href="https://ipfs.io/ipfs/QmWTiPuw52UK2FQFDbnwABE8oJfnSps4VHCCzPkWXY8ZtF?filename=disclaimer.html" 
              target="_blank" 
              rel="noopener noreferrer">
              disclaimer
            </a>
          </label>
        </div>

        {/* Submit Button */}
        <div>
          <button type="submit" disabled={loading || !disclaimerChecked}>
            {loading ? 'Uploading...' : 'Submit Audio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitSongForm;
