import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useWeb3Context, readContract, writeContract, config, useAccount, waitForTransactionReceipt } from "@megotickets/wallet";
import { Contract } from "ethers";
import { getPlaylistABI, getPlaylistAddress } from "../contracts/DecentralizePlaylist/contract";
import { getScheduleLiveABI, getScheduleLiveAddress } from "../contracts/ScheduleLive/contract";
import { RadioMode, LiveStreamPlatform, Song } from "../interfaces/interface";
import { getLivePlatformFromUri } from "../utils/Utils";
import { getSoulBoundTokenABI, getSoulBoundTokenAddress } from "../contracts/SoulBoundToken/contract";


interface Web3RadioContextType {
    playlistContract: Contract | null;
    playlist: any[];
    currentSong: any;
    setCurrentSong: (song: any) => void;
    fetchPlaylist: () => Promise<void>;
    fetchUserSongs: () => Promise<void>;
    fetchMySaves: () => Promise<void>;
    removeSubmittedUserSong: (id: any) => Promise<void>;
    removeSavedSong: (id: any) => Promise<void>;
    saveSongToMySaves: (id: any) => Promise<void>;
    scheduleLiveContract: Contract | null;
    deleteScheduledEvent: (id: any) => Promise<void>;
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
    scheduleLive: (title: string, imageUrl: string, streamUrl: string, startTime: number, duration: number) => Promise<void>;

    liveStreamPlatform: LiveStreamPlatform;
}

export const Web3RadioContext = createContext<Web3RadioContextType | undefined>(undefined);

export const Web3RadioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [playlist, setPlaylist] = useState<Song[]>([]);
    const [currentSong, setCurrentSong] = useState<any>(null);

    const [liveStreamPlatform, setLiveStreamPlatform] = useState<LiveStreamPlatform>(LiveStreamPlatform.NOT_SPECIFIED);
    const { loggedAs, getProvider, isLoading, openMegoModal, getSigner } = useWeb3Context();

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

    useEffect(() => {
        const isUserLogged = localStorage.getItem("loggedAs");
        if (!isUserLogged) {
            setIsConnected(false);
            openMegoModal();
        }
    }, [loggedAs]);

    const initializeProvider = useCallback(async () => {
        if (loggedAs) {
            try {

                setIsConnected(true);
                //TODO: Controllare se l'utente ha il SBT
                console.log("ABI: ", getSoulBoundTokenABI());
                console.log("ADDRESS: ", getSoulBoundTokenAddress());
                const hasSBT = await readContract(config,{
                    abi: getSoulBoundTokenABI(),
                    address: getSoulBoundTokenAddress() as `0x${string}`,
                    functionName: "balanceOf",
                    args: [loggedAs]
                });
                console.log("hasSBT", hasSBT);


                if (hasSBT == 0) {
                    console.log("[initializeProvider] L'utente non possiede un SBT");
                    setUserHasSBT(false);
                    return;
                }else{
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
                const playlistIds =  await readContract(config,{
                    abi: getPlaylistABI(),
                    address: getPlaylistAddress() as `0x${string}`,
                    functionName: "viewPlaylist"
                }) as Array<Number>;

                console.log("playlistIds", playlistIds);

                const playlistData = await Promise.all(
                    playlistIds.map(async (id: any) => {
                        const song = await readContract(config,{
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
                const userAddress = loggedAs;
                const userSongIds = await readContract(config,{
                    abi: getPlaylistABI(),
                    address: getPlaylistAddress() as `0x${string}`,
                    functionName: "getUserSongs",
                    args: [userAddress]
                }) as Array<Number>;
                let userSongs = await Promise.all(
                    userSongIds.map(async (id: any) => {
                        const song = await readContract(config,{
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
        if (userHasSBT) {
            console.log("[fetchMySaves] Fetching saved song IDs... with address: ", loggedAs);
            console.log("[fetchMySaves] -> getPlaylistAddress()", getPlaylistAddress());
            console.log("[fetchMySaves] -> getPlaylistABI()", getPlaylistABI());
            try {
                const savedSongIds = await readContract(config,{
                    abi: getPlaylistABI(),
                    address: getPlaylistAddress() as `0x${string}`,
                    functionName: "retrieveMySaves",
                    account: address as `0x${string}`
                }) as Array<Number>;
                console.log("[fetchMySaves] -> savedSongIds", savedSongIds);
                // Fetch details for each saved song
                console.log("[fetchMySaves] -> savedSongIds", savedSongIds);

                // Fetch details for each saved song
                const formattedSaves = await Promise.all(
                    savedSongIds.map(async (id: any) => {
                        console.log("[fetchMySaves] -> id", id);
                        const song = await readContract(config,{
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
                setSavedSongs(formattedSaves.filter((song) => song.isActive)); // Exclude inactive songs
            } catch (error) {
                console.error("[fetchMySaves] Error fetching my saves:", error);
                setSavedSongs([]);
            }
        }
    }, [playlistContract, getProvider, userHasSBT]);

    //TODO: Implement this!
    const fetchLiveSong = useCallback(async () => {
        console.log("[fetchLiveSong] Fetching live song");
        try {
            if (userHasSBT) {
                const onAirInformation = await readContract(config,{
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
                    }else{
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
        if (userHasSBT) {
            const tx = await writeContract(config,{
                abi: getPlaylistABI(),
                address: getPlaylistAddress() as `0x${string}`,
                functionName: "removeOwnSong",
                args: [songId]
            });

            await waitForTransactionReceipt(config, { hash: tx });

            fetchUserSongs();
        }
    }, [playlistContract, getProvider, userHasSBT]);

    const removeSavedSong = useCallback(async (id: any) => {
        const songId = id.replace("p-", ""); //This is for de-sync playlist and liveschedule SC (id policy)
        console.log("[removeSavedSong] Song ID to remove:", songId);
        
        if ( userHasSBT) {
            const tx = await writeContract(config,{
                abi: getPlaylistABI(),
                address: getPlaylistAddress() as `0x${string}`,
                functionName: "removeFromMySaves",
                args: [songId]
            });
            await waitForTransactionReceipt(config, { hash: tx });
            fetchMySaves();
        }
    }, [playlistContract, getProvider, userHasSBT]);

    const saveSongToMySaves = useCallback(async (id: any) => {
        const songId = id.replace("p-", ""); //This is for de-sync playlist and liveschedule SC (id policy)
        if (userHasSBT) {
            const tx = await writeContract(config,{
                abi: getPlaylistABI(),
                address: getPlaylistAddress() as `0x${string}`,
                functionName: "addToMySaves",
                args: [songId]
            });
            await waitForTransactionReceipt(config, { hash: tx });
            fetchMySaves();
        }
    }, [playlistContract, getProvider, userHasSBT]);

    const fetchBookedSlots = useCallback(async () => {
        if (userHasSBT) {
            try {
                console.log("[fetchBookedSlots] Fetching booked slots");
                const eventIds = await readContract(config,{
                    abi: getScheduleLiveABI(),
                    address: getScheduleLiveAddress() as `0x${string}`,
                    functionName: "getMyBookedShows",
                    account: address as `0x${string}`
                }) as Array<Number>;
                console.log("[fetchBookedSlots] -> eventIds", eventIds);
                const events = await Promise.all(
                    eventIds.map(async (eventId: any) => {
                        const event = await readContract(config,{
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
    }, [scheduleLiveContract, getProvider, userHasSBT]);

    const fetchNext24HoursEvents = useCallback(async () => {
        if (userHasSBT) {
            try {
                const eventIds = await readContract(config,{
                    abi: getScheduleLiveABI(),
                    address: getScheduleLiveAddress() as `0x${string}`,
                    functionName: "getLiveShowsInNext24Hours"
                }) as Array<Number>;
                const events = await Promise.all(
                    eventIds.map(async (eventId: any) => {
                        const event = await readContract(config,{
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

    const scheduleLive = useCallback(async (title: string, imageUrl: string, streamUrl: string, startTime: number, duration: number) => {
        if (userHasSBT) {
            const tx = await writeContract(config,{
                abi: getScheduleLiveABI(),
                address: getScheduleLiveAddress() as `0x${string}`,
                functionName: "scheduleEvent",
                args: [title, imageUrl, streamUrl, startTime, duration]
            });
            await waitForTransactionReceipt(config, { hash: tx });
            fetchBookedSlots();
            fetchNext24HoursEvents();
        }
    }, [scheduleLiveContract, getProvider, userHasSBT]);

    const deleteScheduledEvent = useCallback(async (eventId: any) => {
        if (userHasSBT) {
            console.log("[deleteScheduledEvent] Deleting scheduled event -> ", eventId);
            const tx = await writeContract(config,{
                abi: getScheduleLiveABI(),
                address: getScheduleLiveAddress() as `0x${string}`,
                functionName: "deleteEvent",
                args: [eventId]
            });
            await waitForTransactionReceipt(config, { hash: tx });
            console.log("[deleteScheduledEvent] Event deleted");
            fetchBookedSlots();
            fetchNext24HoursEvents();
        }
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
                liveStreamPlatform
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
