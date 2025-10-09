import React, { useEffect, useState } from "react";
import Web3AudioPlayer from "./components/Web3AudioPlayer";
import Donate from "./components/Donate";
import Logo from "./components/Logo";
import Title from "./components/Title";
import RadioModality from "./components/RadioModality";
import { useWeb3Radio } from "./context/Web3RadioContext";
import ConnectWithMego from "./components/ConnectWithMego";
import { MegoWalletButton, useWeb3Context } from "@megotickets/wallet";
import { optimism, custom, createWalletClient } from "@megotickets/core";

const App: React.FC = () => {
    const { isConnected } = useWeb3Radio(); // Removed userHasSBT
    const { provider, isConnectedWithMego } = useWeb3Context();

    //AddChain to wallet if there is (only for external wallets like Metamask)
    const addChain = async () => {
        try {
            // Only if not connected via Mego (Google/Apple) and if window.ethereum is available
            if (!isConnectedWithMego() && window.ethereum) {
                const walletClient = createWalletClient({
                    chain: optimism,
                    transport: custom(window.ethereum!),
                });
                await walletClient.addChain({ chain: optimism });
            }
        } catch (error) {
            console.log("Errore durante l'aggiunta della chain:", error);
        }
    }

    //AddChain to wallet for security (only for external wallets)
    useEffect(() => {
        if (isConnected && !isConnectedWithMego()) {
            addChain();
        }
    }, [isConnected, provider]);

    return (
        <>
            <div className="mt-10">
                {isConnected &&
                    <MegoWalletButton
                        forceChainId={Number(process.env.REACT_APP_CHAIN_ID)}
                        providerConfiguration={{
                            appleProvider: true,
                            googleProvider: true,
                            emailProvider: true,
                        }}
                        customStyle={{
                            megoWalletContainerStyle: {
                                borderColor: "black",
                                color: "black",
                            },
                            megoWalletIconStyle: {
                                stroke: 'black',
                            }
                        }}
                    />}
            </div>
            <div className="flex gap-10 flex-col max-w-screen-lg items-center justify-center pt-10">
                <Logo />
                <Title />

                {
                    isConnected &&
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
            </div>
        </>
    );
};

export default App; 