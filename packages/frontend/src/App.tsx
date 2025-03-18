import React, { useEffect, useState } from "react";
import Web3AudioPlayer from "./components/Web3AudioPlayer";
import Donate from "./components/Donate";
import Logo from "./components/Logo";
import Title from "./components/Title";
import RadioModality from "./components/RadioModality";
import { useWeb3Radio } from "./context/Web3RadioContext";
import ClaimSoulBoundToken from "./components/ClaimSoulBoundToken";
import ConnectWithMego from "./components/ConnectWithMego";
import { MegoWalletButton } from "@megotickets/wallet";
import { optimism, custom, createWalletClient } from "@megotickets/core";

const App: React.FC = () => {
    const { isConnected, userHasSBT } = useWeb3Radio();

    //AddChain to wallet if there is
    const addChain = async () => {
        try {
            const walletClient = createWalletClient({
                chain: optimism,
                transport: custom(window.ethereum!),
            });
            await walletClient.addChain({ chain: optimism });
        } catch (error) {
            
        }
    }

    //AddChain to wallet for security
    useEffect(() => {
        addChain();
    }, []);

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
        </>
    );
};

export default App; 