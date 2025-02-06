import React from "react";
import { useWeb3Radio } from "../context/Web3RadioContext";

interface DonateProps {}

const Donate: React.FC<DonateProps> = () => {
  const { currentSong } = useWeb3Radio();
  console.log("Donate component received creatorAddress:", currentSong?.creatorAddress); // Debug
  
  if (!currentSong && !currentSong?.submitter) {
    return <p>No creator information available</p>; // Fixed syntax issue (removed extra '>')
  }

  return (
    <div style={{ margin: "20px 0", textAlign: "center" }}>
      <h3>Support the Creator</h3>
      <p>
        <strong>Tip the creator:</strong> {currentSong?.submitter}
      </p>
      <a
        href={`https://etherscan.io/address/${currentSong?.submitter}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View on Etherscan
      </a>
    </div>
  );
};

export default Donate; 