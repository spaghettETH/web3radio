import React, { useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { ethers } from 'ethers';

// Function to generate multiple IPFS gateway URLs for a given CID, with safeguards
const resolveIpfsUris = (uri) => {
  if (!uri) {
    console.error("Undefined URI passed to resolveIpfsUris");
    return [];
  }
  
  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "");
    return [
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://ipfs.infura.io/ipfs/${cid}`,
      `https://gateway.pinata.cloud/ipfs/${cid}`,
    ];
  }
  return [uri];
};

const AudioPlayer = ({ playlist }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [countdown, setCountdown] = useState(60); // 1 minute countdown
  const [transactionConfirmed, setTransactionConfirmed] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [hasPaid, setHasPaid] = useState(false); // Track if user has already paid

  // Countdown timer effect, only active if user hasn't paid yet
  useEffect(() => {
    if (playing && !transactionConfirmed && countdown > 0 && !hasPaid) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0 && !transactionConfirmed && !hasPaid) {
      setPlaying(false);
      alert("Payment not received. Stopping playback.");
    }
  }, [playing, transactionConfirmed, countdown, hasPaid]);

  // Handle play button click and initiate payment only if user hasn't paid
  const handlePlay = useCallback(async () => {
    if (!hasPaid) {
      try {
        setPlaying(true); // Start the playback initially

        // Request payment of 0.0001 ETH
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const tx = await signer.sendTransaction({
          to: "0xE7D1DA38a3530F510B10A83FF25Cfbd0a32e1A95", // Replace with the address receiving the payment
          value: ethers.parseEther("0.0001"),
        });

        // Listen for transaction confirmation
        await tx.wait();
        setTransactionConfirmed(true);
        setHasPaid(true); // Set hasPaid to true after first payment
        alert("Payment confirmed. Enjoy the music!");

      } catch (error) {
        console.error("Transaction failed or rejected:", error);
        setPlaying(false);
        setCountdown(60); // Reset countdown
        alert("Transaction was not successful. Playback stopped.");
        return;
      }
    } else {
      setPlaying(true); // Resume playback if user has already paid
    }
  }, [hasPaid]);

  // Check and set a working IPFS URL for the current track
  useEffect(() => {
    if (playlist.length === 0 || !playlist[currentIndex]?.uri) {
      console.warn("Playlist is empty or URI is undefined");
      setFileUrl(null);
      return;
    }

    const uris = resolveIpfsUris(playlist[currentIndex]?.uri);

    const checkUris = async () => {
      for (let uri of uris) {
        try {
          const response = await fetch(uri, { method: 'HEAD' });
          if (response.ok) {
            setFileUrl(uri);
            return;
          }
        } catch (error) {
          console.warn(`Could not fetch ${uri}:`, error);
        }
      }
      setFileUrl(null); // If none of the URLs work, set to null
      console.error("Could not resolve any IPFS gateway URL for CID:", uris);
    };

    checkUris();
  }, [currentIndex, playlist]);

  const handleEnded = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    setCountdown(60); // Reset countdown for the next track
    setTransactionConfirmed(hasPaid); // If user has paid, maintain transaction confirmation
  };

  return (
    <div>
      <h2>Now Playing</h2>
      {playlist.length > 0 ? (
        <div>
          <h3>{playlist[currentIndex].title}</h3>
          <ReactPlayer
            url={fileUrl}
            playing={playing}
            controls
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                },
              },
            }}
            height="50px"
            width="100%"
            onEnded={handleEnded}
          />
          <button onClick={handlePlay} disabled={playing}>
            {playing ? "Playing" : "Play with Payment"}
          </button>
          {playing && !transactionConfirmed && !hasPaid && (
            <p>Payment required to continue: {countdown} seconds remaining</p>
          )}
        </div>
      ) : (
        <p>No song currently available or failed to load.</p>
      )}
    </div>
  );
};

export default AudioPlayer;
