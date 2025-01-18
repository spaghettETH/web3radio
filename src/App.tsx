import React, { useState } from "react";
import Web3AudioPlayer from "./components/Web3AudioPlayer";
import SubmitSongForm from "./components/SubmitSongForm";
import RemoveOwnSong from "./components/RemoveOwnSong";
import MySaves from "./components/MySaves";
import SavesLeaderboard from "./components/SavesLeaderboard";
import Donate from "./components/Donate";
import ScheduleLive from "./components/ScheduleLive";
import Logo from "./components/Logo";
import Title from "./components/Title";
import RadioModality from "./components/RadioModality";
import WalletButton from "./components/megoComponents/WalletButton";
import { useWeb3Radio } from "./context/Web3RadioContext";

const App: React.FC = () => {
    const [currentSong, setCurrentSong] = useState<any>(null);
    const { isConnected } = useWeb3Radio();

    return (
        <div className="flex gap-10 flex-col max-w-screen-lg items-center justify-center pt-10">
            <WalletButton />
            <Logo />
            <Title />
            {isConnected ? (
                <>
                    <Web3AudioPlayer 
                        setSong={(song:any) => {
                            console.log("Setting current song:", song);
                            setCurrentSong(song);
                        }}
                    />
                    <RadioModality onModalityChange={(modality:string) => {
                        console.log("Modality changed:", modality);
                    }} />
                    {currentSong && currentSong.submitter ? (
                        <Donate creatorAddress={currentSong.submitter} />
                    ) : (
                        <p>No creator information available.</p>
                    )}
                    <RemoveOwnSong />
                    <div className="w-full px-10">
                        <SubmitSongForm />
                    </div>
                    <div className="w-full">
                        <MySaves currentSong={currentSong} />
                        <SavesLeaderboard />
                    </div>
                    <ScheduleLive />
                    <Donate creatorAddress={currentSong?.submitter} />
                </>
            ) : (
                <p>Please connect to MetaMask.</p>
            )}
        </div>
    );
};

export default App; 