import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useWeb3Context } from "@megotickets/wallet";
import {readContract, writeContract, config, useAccount, waitForTransactionReceipt, signMessage} from "@megotickets/core";
import { Contract } from "ethers";
import { getPlaylistABI, getPlaylistAddress } from "../contracts/DecentralizePlaylist/contract";
import { getScheduleLiveABI, getScheduleLiveAddress } from "../contracts/ScheduleLive/contract";
import { RadioMode, LiveStreamPlatform, Song, BlockChainOperationResult } from "../interfaces/interface";
import { getLivePlatformFromUri } from "../utils/Utils";
import { getSoulBoundTokenABI, getSoulBoundTokenAddress } from "../contracts/SoulBoundToken/contract";
import { usePopup } from "./PopupContext";
import axios from "axios";

interface Web3RadioContextType {
    playlistContract: Contract | null;
    playlist: any[];
    currentSong: any;
    setCurrentSong: (song: any) => void;
    fetchPlaylist: () => Promise<void>;
    fetchUserSongs: () => Promise<void>;
    fetchMySaves: () => Promise<void>;
    removeSubmittedUserSong: (id: any) => Promise<BlockChainOperationResult>;
    removeSavedSong: (id: any) => Promise<BlockChainOperationResult>;
    saveSongToMySaves: (id: any) => Promise<BlockChainOperationResult>;
    scheduleLiveContract: Contract | null;
    deleteScheduledEvent: (id: any) => Promise<BlockChainOperationResult>;
    mySongs: any[];
    savedSongs: any[];
    isConnected: boolean;
    radioModality: string;
    userHasSBT: boolean;

    // Booked slots
    bookedSlots: any[];
    fetchBookedSlots: () => Promise<void>;
    next24HoursEvents: any[];
    fetchNext24HoursEvents: () => Promise<void>;
    scheduleLive: (title: string, imageUrl: string, streamUrl: string, startTime: number, duration: number, tagBytes32: string) => Promise<BlockChainOperationResult>;

    liveStreamPlatform: LiveStreamPlatform;

    createSignatureWithMego: (message: string, encoded?: boolean) => void;
    setMegoPendingDate: (op: string, data: any, signMessage: string, popupTitle: string, popupMessage: string, contract: string, userAddress: string, message?: string) => void;
}

export const Web3RadioContext = createContext<Web3RadioContextType | undefined>(undefined);

export const Web3RadioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [playlist, setPlaylist] = useState<Song[]>([]);
    const [currentSong, setCurrentSong] = useState<any>(null);

    const [liveStreamPlatform, setLiveStreamPlatform] = useState<LiveStreamPlatform>(LiveStreamPlatform.NOT_SPECIFIED);
    const { loggedAs, getProvider, isLoading, openMegoModal, provider, signMessageWithGoogle, signMessageWithApple, isConnectedWithMego } = useWeb3Context();

    // Contracts
    const [playlistContract, setPlaylistContract] = useState<Contract | null>(null);
    const [scheduleLiveContract, setScheduleLiveContract] = useState<Contract | null>(null);
    const [soulBoundTokenContract, setSoulBoundTokenContract] = useState<Contract | null>(null);
    const [mySongs, setMySongs] = useState<any[]>([]);
    const [savedSongs, setSavedSongs] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [userHasSBT, setUserHasSBT] = useState<boolean>(false);
    const [radioModality, setRadioModality] = useState<RadioMode>(RadioMode.LIVE);

    // Booked slots
    const [bookedSlots, setBookedSlots] = useState<any[]>([]);
    const [next24HoursEvents, setNext24HoursEvents] = useState<any[]>([]);

    const { address } = useAccount();
    const { openPopup } = usePopup();

    let count = 0;

    useEffect(() => {
        const isUserLogged = localStorage.getItem("loggedAs");
        if (!isUserLogged) {
            setIsConnected(false);
            openMegoModal();
        }
    }, [loggedAs]);

    const initializeProvider = useCallback(async () => {
        const userWallet = loggedAs || address;
        if (userWallet) {
            try {
                
                setIsConnected(true);
                //TODO: Controllare se l'utente ha il SBT
                console.log("ABI: ", getSoulBoundTokenABI());
                console.log("ADDRESS: ", getSoulBoundTokenAddress());
                console.log("USER WALLET: ", userWallet);

                const hasSBT = await readContract(config, {
                    abi: getSoulBoundTokenABI(),
                    address: getSoulBoundTokenAddress() as `0x${string}`,
                    functionName: "balanceOf",
                    args: [userWallet]
                });
                console.log("hasSBT", hasSBT);


                if (hasSBT == 0) {
                    console.log("[initializeProvider] L'utente non possiede un SBT");
                    setUserHasSBT(false);
                    return;
                } else {
                    console.log("[initializeProvider] L'utente possiede un SBT");
                    setUserHasSBT(true);
                }

                console.log("[initializeProvider] Contracts initialized with signer");
            } catch (error) {
                console.log("[initializeProvider] Error:", error);
            }
        }
    }, [loggedAs]);

    // Aggiungiamo un effetto per reinizializzare i contratti quando cambia il provider
    useEffect(() => {
        if (loggedAs) {
            initializeProvider();
        }
    }, [loggedAs, initializeProvider]);

    const fetchPlaylist = useCallback(async () => {
        if (userHasSBT) {
            try {
                const playlistIds = await readContract(config, {
                    abi: getPlaylistABI(),
                    address: getPlaylistAddress() as `0x${string}`,
                    functionName: "viewPlaylist"
                }) as Array<Number>;

                console.log("playlistIds", playlistIds);

                const playlistData = await Promise.all(
                    playlistIds.map(async (id: any) => {
                        const song = await readContract(config, {
                            abi: getPlaylistABI(),
                            address: getPlaylistAddress() as `0x${string}`,
                            functionName: "getSongDetails",
                            args: [id]
                        }) as any;
                        console.log("song N°[", id, "]", song);
                        return song.isActive
                            ? {
                                id: `p-${song.id.toString()}`,
                                uri: song.uri,
                                img: song.img,
                                title: song.title,
                                submitter: song.submitter
                            }
                            : null;
                    })
                );
                console.log("[fetchPlaylist] -> playlistData", playlistData);
                setPlaylist(playlistData.filter((song) => song !== null) as Song[]); // Filtra le canzoni inattive
                setRadioModality(RadioMode.PLAYLIST);
                setLiveStreamPlatform(LiveStreamPlatform.NOT_SPECIFIED);
            } catch (error) {
                console.error("Errore durante il recupero della playlist:", error);
                setPlaylist([]);
                setRadioModality(RadioMode.PLAYLIST);
                setLiveStreamPlatform(LiveStreamPlatform.NOT_SPECIFIED);
            }
        }
    }, [playlistContract, userHasSBT]);

    // Fetch user's submitted songs
    const fetchUserSongs = useCallback(async () => {
        if (userHasSBT) {
            try {
                console.log("[fetchUserSongs] Fetching user's songs");
                const userAddress = loggedAs;
                console.log("[fetchUserSongs] -> userAddress", userAddress);
                const userSongIds = await readContract(config, {
                    abi: getPlaylistABI(),
                    address: getPlaylistAddress() as `0x${string}`,
                    functionName: "getUserSongs",
                    args: [userAddress]
                }) as Array<Number>;
                console.log("[fetchUserSongs] -> userSongIds", userSongIds);
                let userSongs = await Promise.all(
                    userSongIds.map(async (id: any) => {
                        const song = await readContract(config, {
                            abi: getPlaylistABI(),
                            address: getPlaylistAddress() as `0x${string}`,
                            functionName: "getSongDetails",
                            args: [id]
                        }) as any;
                        return song.isActive
                            ? {
                                id: `p-${song.id.toString()}`,
                                title: song.title || "(Untitled)",
                                uri: song.uri,
                                img: song.img
                            }
                            : null;
                    })
                );
                setMySongs(userSongs.filter((song) => song)); // Exclude inactive songs
            } catch (error) {
                console.error("Error fetching user's songs:", error);
                setMySongs([]);
            }
        }
    }, [playlistContract, getProvider, userHasSBT]);

    const fetchMySaves = useCallback(async () => {

        const userAddress = address || loggedAs;
        if (userHasSBT) {
            console.log("[fetchMySaves] Fetching saved song IDs... with address: ", userAddress);
            console.log("[fetchMySaves] -> getPlaylistAddress()", getPlaylistAddress());
            console.log("[fetchMySaves] -> getPlaylistABI()", getPlaylistABI());
            const signMessageForTransaction = "Fetch my saves";
            try {
                const savedSongIds = await readContract(config, {
                    abi: getPlaylistABI(),
                    address: getPlaylistAddress() as `0x${string}`,
                    functionName: "retrieveMySaves",
                    account: userAddress as `0x${string}`,
                    args: [userAddress as `0x${string}`]
                }) as Array<Number>;
                console.log("[fetchMySaves] -> savedSongIds", savedSongIds);
                // Fetch details for each saved song
                console.log("[fetchMySaves] -> savedSongIds", savedSongIds);

                // Fetch details for each saved song
                const formattedSaves = await Promise.all(
                    savedSongIds.map(async (id: any) => {
                        console.log("[fetchMySaves] -> id", id);
                        const song = await readContract(config, {
                            abi: getPlaylistABI(),
                            address: getPlaylistAddress() as `0x${string}`,
                            functionName: "songsById",
                            args: [id]
                        }) as any;
                        const formattedSong = {
                            id: `p-${song[0].toString()}`,
                            title: song[3],
                            uri: song[1],
                            img: song[2],
                            isActive: song[5], // Respect active status
                        };
                        console.log("[fetchMySaves] -> formattedSong", formattedSong);
                        return formattedSong;
                    })
                );
                setSavedSongs(formattedSaves.filter((song) => song.isActive !== "0x0000000000000000000000000000000000000000")); // Exclude inactive songs
            } catch (error) {
                console.error("[fetchMySaves] Error fetching my saves:", error);
                setSavedSongs([]);
            }
        }
    }, [playlistContract, getProvider, userHasSBT]);

    const fetchLiveSong = useCallback(async () => {
        console.log("[fetchLiveSong] Fetching live song");
        try {
            if (userHasSBT) {
                const onAirInformation = await readContract(config, {
                    abi: getScheduleLiveABI(),
                    address: getScheduleLiveAddress() as `0x${string}`,
                    functionName: "onAirNow"
                }) as any;
                let isOnAir = onAirInformation["0"]
                console.log("[fetchLiveSong] -> isOnAir", isOnAir);
                if (isOnAir) {
                    const liveSong: Song = {
                        id: `l-${onAirInformation["1"]?.id.toString()}`,
                        title: onAirInformation["1"]?.title || "",
                        img: onAirInformation["1"]?.imageUrl || "",
                        uri: onAirInformation["1"]?.livestreamUrl || "",
                        submitter: onAirInformation["1"]?.creator || ""
                    }
                    console.log("[fetchLiveSong] Live song in this moment:", liveSong);

                    if (playlist.length === 0 || playlist[0].id !== liveSong.id) {
                        console.log("[fetchLiveSong] Aggiornamento della live song");
                        setPlaylist([liveSong]);
                        setLiveStreamPlatform(getLivePlatformFromUri(liveSong.uri));
                        setRadioModality(RadioMode.LIVE);
                    } else {
                        console.log("[fetchLiveSong] La live è già in esecuzione ...");
                    }
                    return liveSong;
                }
                console.log("[fetchLiveSong] No live song in this moment");
                return null;
            } else {
                console.log("[fetchLiveSong] No scheduleLiveContract or provider");
                return null;
            }
        } catch (error) {
            console.error("[fetchLiveSong] Error:", error);
            return null;
        }
    }, [scheduleLiveContract, playlist, getProvider, userHasSBT]);

    const removeSubmittedUserSong = useCallback(async (id: any) => {

        const songId = id.replace("p-", ""); //This is for de-sync playlist and liveschedule SC (id policy)
        const signMessageForTransaction = "Remove own song: " + songId;
        if(isConnectedWithMego()) {
            setMegoPendingDate("removeOwnSong", [`${songId}`], signMessageForTransaction, "Removing...", "Removing song " + songId, "playlist", loggedAs as string);
            createSignatureWithMego(signMessageForTransaction);
            return BlockChainOperationResult.PENDING;
        }
        
        if (userHasSBT) {
            const signature = await signMessage(config, { message: signMessageForTransaction });
            const tx = await writeContract(config, {
                abi: getPlaylistABI(),
                address: getPlaylistAddress() as `0x${string}`,
                functionName: "removeOwnSong",
                args: [songId, signature]
            });

            await waitForTransactionReceipt(config, { hash: tx });

            fetchUserSongs();
        }
        return BlockChainOperationResult.SUCCESS;
    }, [playlistContract, getProvider, userHasSBT]);

    const removeSavedSong = useCallback(async (id: any) => {
        const songId = id.replace("p-", ""); //This is for de-sync playlist and liveschedule SC (id policy)
        console.log("[removeSavedSong] Song ID to remove:", songId);
        const signMessageForTransaction = "Remove from my saves: " + songId;

        const isMego = isConnectedWithMego();
        if (isMego) {
            setMegoPendingDate("removeFromMySaves", [`${songId}`], signMessageForTransaction, "Removing...", "Removing song " + songId, "playlist", loggedAs as string);
            createSignatureWithMego(signMessageForTransaction);
            return BlockChainOperationResult.PENDING; 
        }

        if (userHasSBT) {
            const signature = await signMessage(config, { message: signMessageForTransaction });
            const tx = await writeContract(config, {
                abi: getPlaylistABI(),
                address: getPlaylistAddress() as `0x${string}`,
                functionName: "removeFromMySaves",
                args: [songId, signature]
            });
            await waitForTransactionReceipt(config, { hash: tx });
            fetchMySaves();
        }
        return BlockChainOperationResult.SUCCESS;
    }, [playlistContract, getProvider, userHasSBT]);

    const saveSongToMySaves = useCallback(async (id: any) => {

        const songId = id.replace("p-", "");
        const signMessageForTransaction = "Add to my saves: " + songId;
        // Check if connected with mego
        const isMego = isConnectedWithMego();
        //Convert songId to number
        if (isMego && provider) {
            setMegoPendingDate("addToMySaves", [`${songId}`], signMessageForTransaction, "Saving...", "Saving song " + songId, "playlist", loggedAs as string);
            createSignatureWithMego(signMessageForTransaction);
            return BlockChainOperationResult.PENDING;
        }

        if (userHasSBT) {
            const signature = await signMessage(config, { message: signMessageForTransaction });
            const tx = await writeContract(config, {
                abi: getPlaylistABI(),
                address: getPlaylistAddress() as `0x${string}`,
                functionName: "addToMySaves",
                args: [songId, signature]
            });
            await waitForTransactionReceipt(config, { hash: tx });
            fetchMySaves();
        }
        return BlockChainOperationResult.SUCCESS;
    }, [playlistContract, getProvider, userHasSBT]);

    const fetchBookedSlots = useCallback(async () => {
        console.log("[fetchBookedSlots] Fetching booked slots");

        const userAddress = address || loggedAs;

        if (userHasSBT) {
            try {
                console.log("[fetchBookedSlots] Fetching because user has SBT");
                const eventIds = await readContract(config, {
                    abi: getScheduleLiveABI(),
                    address: getScheduleLiveAddress() as `0x${string}`,
                    functionName: "getMyBookedShows",
                    account: userAddress as `0x${string}`,
                    args: [userAddress as `0x${string}`]
                }) as Array<Number>;
                console.log("[fetchBookedSlots] -> eventIds", eventIds);
                const events = await Promise.all(
                    eventIds.map(async (eventId: any) => {
                        const event = await readContract(config, {
                            abi: getScheduleLiveABI(),
                            address: getScheduleLiveAddress() as `0x${string}`,
                            functionName: "getEventDetails",
                            args: [eventId]
                        }) as any;
                        return event.isActive
                            ? {
                                id: event.id,
                                title: event.title,
                                imageUrl: event.imageUrl,
                                livestreamUrl: event.livestreamUrl,
                                startTime: new Date(Number(event.startTime) * 1000).toLocaleString(),
                                endTime: new Date(Number(event.endTime) * 1000).toLocaleString(),
                            }
                            : null;
                    })
                );
                setBookedSlots(events.filter((event) => event !== null));
            } catch (error) {
                console.error("Error fetching booked slots:", error);
            }
        }
    }, [scheduleLiveContract, getProvider, userHasSBT, address]);

    const fetchNext24HoursEvents = useCallback(async () => {
        console.log("[fetchNext24HoursEvents] Fetching next 24 hours events");
        if (userHasSBT) {
            try {
                const eventIds = await readContract(config, {
                    abi: getScheduleLiveABI(),
                    address: getScheduleLiveAddress() as `0x${string}`,
                    functionName: "getLiveShowsInNext24Hours"
                }) as Array<Number>;
                console.log("[fetchNext24HoursEvents] -> eventIds", eventIds);
                const events = await Promise.all(
                    eventIds.map(async (eventId: any) => {
                        const event = await readContract(config, {
                            abi: getScheduleLiveABI(),
                            address: getScheduleLiveAddress() as `0x${string}`,
                            functionName: "getEventDetails",
                            args: [eventId]
                        }) as any;
                        return event.isActive
                            ? {
                                id: event.id,
                                title: event.title,
                                imageUrl: event.imageUrl,
                                livestreamUrl: event.livestreamUrl,
                                startTime: new Date(Number(event.startTime) * 1000).toLocaleString(),
                                endTime: new Date(Number(event.endTime) * 1000).toLocaleString(),
                            }
                            : null;
                    })
                );
                setNext24HoursEvents(events.filter((event) => event !== null));
            } catch (error) {
                console.error("Error fetching live shows in the next 24 hours:", error);
            }
        }
    }, [scheduleLiveContract, getProvider, userHasSBT]);

    const scheduleLive = useCallback(async (title: string, imageUrl: string, streamUrl: string, startTime: number, duration: number, tagBytes32: string) => {
        
        const signMessageForTransaction = `Schedule event: ${title}`;
        if(isConnectedWithMego()) {
            setMegoPendingDate("scheduleEvent", [`${title}`, imageUrl, streamUrl, tagBytes32, startTime, duration], signMessageForTransaction, "Scheduling...", "Scheduling live " + title, "live", loggedAs as string,`Schedule event: ${title}`);
            createSignatureWithMego(signMessageForTransaction, false);
            return BlockChainOperationResult.PENDING;
        }
        if (userHasSBT) {
            const signature = await signMessage(config, { message: signMessageForTransaction });
            const tx = await writeContract(config, {
                abi: getScheduleLiveABI(),
                address: getScheduleLiveAddress() as `0x${string}`,
                functionName: "scheduleEvent",
                args: [title, imageUrl, streamUrl, tagBytes32, startTime, duration, signature]
            });
            await waitForTransactionReceipt(config, { hash: tx });
            fetchBookedSlots();
            fetchNext24HoursEvents();
        }
        return BlockChainOperationResult.SUCCESS;
    }, [scheduleLiveContract, getProvider, userHasSBT]);

    const deleteScheduledEvent = useCallback(async (eventId: any) => {

        if(isConnectedWithMego()) {
            const signMessageForTransaction = "Delete event: " + eventId;
            setMegoPendingDate("deleteEvent", [`${eventId}`], signMessageForTransaction, "Deleting...", "Deleting scheduled event " + eventId, "live", loggedAs as string);
            createSignatureWithMego(signMessageForTransaction, false);
            return BlockChainOperationResult.PENDING;
        }
        if (userHasSBT) {
            console.log("[deleteScheduledEvent] Deleting scheduled event -> ", eventId);
            const signMessageForTransaction = "Delete scheduled event: " + eventId;
            const signature = await signMessage(config, { message: signMessageForTransaction });
            const tx = await writeContract(config, {
                abi: getScheduleLiveABI(),
                address: getScheduleLiveAddress() as `0x${string}`,
                functionName: "deleteEvent",
                args: [eventId, signature]
            });
            await waitForTransactionReceipt(config, { hash: tx });
            console.log("[deleteScheduledEvent] Event deleted");
            fetchBookedSlots();
            fetchNext24HoursEvents();
        }
        return BlockChainOperationResult.SUCCESS;
    }, [scheduleLiveContract, getProvider, userHasSBT]);

    const fetchAllData = useCallback(async () => {
        const checkLiveAndPlaylist = async () => {
            console.log("[fetchAllData] Checking live and playlist");
            let liveSong = await fetchLiveSong();
            if (!liveSong && radioModality !== RadioMode.PLAYLIST) {
                await fetchPlaylist();
            }
        };

        // Esegui immediatamente il primo controllo
        await checkLiveAndPlaylist();

        // Imposta l'intervallo per i controlli successivi
        const intervalId = setInterval(checkLiveAndPlaylist, 10000);
        return () => clearInterval(intervalId);
    }, [fetchLiveSong, fetchPlaylist, radioModality]);

    //Fetch User Songs and My Saves
    const fetchStaticData = useCallback(async () => {
        fetchUserSongs();
        fetchMySaves();
    }, [fetchUserSongs, fetchMySaves]);

    useEffect(() => {
        if (userHasSBT) {
            fetchStaticData();
            const cleanup = fetchAllData();
            return () => {
                cleanup.then(cleanupFn => cleanupFn());
            };
        }
    }, [playlistContract, fetchStaticData, fetchAllData]);


    const executeMegoPendingOp = async () => {
        const megoWritePendingOp = localStorage.getItem("megoWritePendingOp");
        const megoWritePendingData = localStorage.getItem("megoWritePendingData");
        const megoSignatureMessage = localStorage.getItem("megoSignatureMessage");
        const megoMessage = localStorage.getItem("megoMessage");
        const megoPopupTitle = localStorage.getItem("megoPopupTitle");
        const megoPopupMessage = localStorage.getItem("megoPopupMessage");
        const megoWritePendingContract = localStorage.getItem("megoWritePendingContract");
        const megoUserAddress = localStorage.getItem("megoUserAddress");

        if (!megoWritePendingOp || !megoWritePendingData) {
            console.log("[mego] No pending operation");
            cleanMegoPendingDate(); //Defensive programming (DP)
            return;
        }

        //Read signature from mego (query params)
        const urlParams = new URLSearchParams(window.location.search);
        const signature = urlParams.get('signature');
        if (!signature) {
            console.log("[mego] No signature found");
            cleanMegoPendingDate();
            return;
        }

        console.log("signature", signature);

        let data = JSON.parse(megoWritePendingData);
        console.log("[mego] megoWritePendingOp:", megoWritePendingOp);
        console.log("[mego] megoWritePendingData:", data);
        console.log("[mego] megoSignatureMessage:", megoSignatureMessage);
        console.log("[mego] signature:", signature);


        console.log("[mego] data:", data);

        //Oper popup
        openPopup({
            title: megoPopupTitle || 'Pending operation',
            message: megoPopupMessage || 'Pending operation...',
            type: 'loading'
        });

        try {
            const result = await axios.post("https://hammerhead-app-34p34.ondigitalocean.app/relay", {
                functionName: megoWritePendingOp,
                contract: megoWritePendingContract,
                address: megoUserAddress,
                signature,
                message: megoMessage,
                args: [
                    ...data,
                    signature
                ]
            })
            const transactionHash = result.data.transactionHash;
            await waitForTransactionReceipt(config, { hash: transactionHash });
            openPopup({
                title: 'Success',
                message: 'Operation executed successfully',
                type: 'success'
            }); 
            //await 1000ms
            await new Promise(resolve => setTimeout(resolve, 1000));
            //Reload page
            window.location.reload();
        } catch (error) {
            console.log("[mego] Error during operation", error);
            const message = error?.response?.data?.error?.cause?.reason || "Error during operation"
            console.log(error)
            openPopup({
                title: 'Error',
                message,
                type: 'error'
            });
        } finally {
            cleanMegoPendingDate();
        }
    }

    // Check last blockchain operation started with mego
    useEffect(() => {
        if(count === 0) {
            executeMegoPendingOp();
            count++;
        }
    }, []);

    const setMegoPendingDate = (op: string, data: any, signMessage: string, popupTitle: string, popupMessage: string, contract: string, userAddress: string, message?: string) => {
        localStorage.setItem("megoWritePendingOp", op);
        localStorage.setItem("megoWritePendingData", JSON.stringify(data));
        localStorage.setItem("megoSignatureMessage", signMessage);
        localStorage.setItem("megoMessage", message || signMessage);
        localStorage.setItem("megoPopupTitle", popupTitle);
        localStorage.setItem("megoPopupMessage", popupMessage);
        localStorage.setItem("megoWritePendingContract", contract);
        localStorage.setItem("megoUserAddress", userAddress);
    }

    const cleanMegoPendingDate = () => {
        localStorage.removeItem("megoWritePendingOp");
        localStorage.removeItem("megoWritePendingData");
        localStorage.removeItem("megoSignatureMessage");
        localStorage.removeItem("megoMessage");
        localStorage.removeItem("megoPopupTitle");
        localStorage.removeItem("megoPopupMessage");
        localStorage.removeItem("megoWritePendingContract");
        localStorage.removeItem("megoUserAddress");
    }

    const createSignatureWithMego = (message: string, encoded: boolean = false) => {
        const isConnectedWithMego = provider !== 'walletConnect'
        if (isConnectedWithMego && provider) {
            const redirectUrl = window.location.origin
            if (provider.includes("google")) {
                signMessageWithGoogle(redirectUrl, message, encoded);
            } else if (provider.includes("apple")) {
                signMessageWithApple(redirectUrl, message, encoded);
            }
            return false;
        }
    }


    return (
        // @ts-ignore
        <Web3RadioContext.Provider
            value={{
                playlistContract,
                playlist,
                currentSong,
                setCurrentSong,
                fetchPlaylist,
                fetchUserSongs,
                fetchMySaves,
                removeSubmittedUserSong,
                removeSavedSong,
                saveSongToMySaves,
                savedSongs,
                scheduleLiveContract,
                deleteScheduledEvent,
                mySongs,
                isConnected,
                radioModality,
                userHasSBT,
                bookedSlots,
                fetchBookedSlots,
                next24HoursEvents,
                fetchNext24HoursEvents,
                scheduleLive,
                liveStreamPlatform,
                createSignatureWithMego,
                setMegoPendingDate
            }}
        >
            {children}
        </Web3RadioContext.Provider>
    );
};

export const useWeb3Radio = (): Web3RadioContextType => {
    const context = useContext(Web3RadioContext);
    if (!context) {
        throw new Error('useWeb3Radio deve essere usato all\'interno di un Web3RadioProvider');
    }
    return context;
};

export default Web3RadioProvider;
