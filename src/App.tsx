import React, { useState } from "react";
import Web3AudioPlayer from "./components/Web3AudioPlayer";
import SubmitSongForm from "./components/SubmitSongForm";
import RemoveOwnSong from "./components/SubmittedUserSongs";
import MySaves from "./components/MySavesAudio";
import SavesLeaderboard from "./components/SavesLeaderboard";
import Donate from "./components/Donate";
import Logo from "./components/Logo";
import Title from "./components/Title";
import RadioModality from "./components/RadioModality";
import WalletButton from "./components/megoComponents/WalletButton";
import { useWeb3Radio } from "./context/Web3RadioContext";
import ReportAbuse from "./components/ReportAbuse";

const App: React.FC = () => {
    const { isConnected, currentSong } = useWeb3Radio();

    return (
        <div className="flex gap-10 flex-col max-w-screen-lg items-center justify-center pt-10">
            <WalletButton />
            <Logo />
            <Title />
            {isConnected ? (
                <>
                    <Web3AudioPlayer/>
                    <RadioModality
                        onModalityChange={(modality: string) => {
                            console.log("Modality changed:", modality);
                        }} />
                </>
            ) : (
                <p>Please connect to MetaMask.</p>
            )}
        </div>
    );
};

export default App; 