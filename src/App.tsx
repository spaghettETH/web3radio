import React, { useState } from "react";
import Web3AudioPlayer from "./components/Web3AudioPlayer";
import Donate from "./components/Donate";
import Logo from "./components/Logo";
import Title from "./components/Title";
import RadioModality from "./components/RadioModality";
import WalletButton from "./components/megoComponents/WalletButton";
import { useWeb3Radio } from "./context/Web3RadioContext";
import ClaimSoulBoundToken from "./components/ClaimSoulBoundToken";
import ConnectWithMego from "./components/ConnectWithMego";

const App: React.FC = () => {
    const { isConnected, userHasSBT } = useWeb3Radio();

    return (
        <div className="flex gap-10 flex-col max-w-screen-lg items-center justify-center pt-10">
            {isConnected && <WalletButton />}
            <Logo />
            <Title />

            {
                isConnected && userHasSBT &&
                <>
                    <Web3AudioPlayer />
                    <Donate />
                    <RadioModality
                        onModalityChange={(modality: string) => {
                            console.log("Modality changed:", modality);
                        }} />
                </>
            }
            {
                !isConnected &&
                <ConnectWithMego />
            }
            {
                isConnected && !userHasSBT &&
                <ClaimSoulBoundToken />
            }
        </div>
    );
};

export default App; 