import React from "react";

const Donate = ({ creatorAddress }) => {
  console.log("Donate component received creatorAddress:", creatorAddress); // Debug

  if (!creatorAddress) {
    return <p>No creator information available</p>; // Fixed syntax issue (removed extra '>')
  }

  return (
    <div style={{ margin: "20px 0", textAlign: "center" }}>
      <h3>Support the Creator</h3>
      <p>
        <strong>Tip the creator:</strong> {creatorAddress}
      </p>
      <a
        href={`https://etherscan.io/address/${creatorAddress}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View on Etherscan
      </a>
    </div>
  );
};

export default Donate;
