import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useWeb3Context } from "../components/megoComponents/web3-context";
import { Contract } from "ethers";
import { playlistABI, playlistAddress } from "../contracts/DecentralizePlaylist/contract";
import { scheduleLiveABI, scheduleLiveAddress } from "../contracts/ScheduleLive/contract";
import { RadioMode, LiveStreamPlatform, Song } from "../interfaces/interface";
import { getLivePlatformFromUri } from "../utils/Utils";


interface Web3RadioContextType {
    playlistContract: Contract | null;
    playlist: any[];
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
    const [liveStreamPlatform, setLiveStreamPlatform] = useState<LiveStreamPlatform>(LiveStreamPlatform.NOT_SPECIFIED);
    const { loggedAs, getProvider, isLoading, openMegoModal, getSigner } = useWeb3Context();

    // Contracts
    const [playlistContract, setPlaylistContract] = useState<Contract | null>(null);
    const [scheduleLiveContract, setScheduleLiveContract] = useState<Contract | null>(null);
    const [mySongs, setMySongs] = useState<any[]>([]);
    const [savedSongs, setSavedSongs] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [userHasSBT, setUserHasSBT] = useState<boolean>(true);
    const [radioModality, setRadioModality] = useState<RadioMode>(RadioMode.LIVE);

    // Booked slots
    const [bookedSlots, setBookedSlots] = useState<any[]>([]);
    const [next24HoursEvents, setNext24HoursEvents] = useState<any[]>([]);

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
                console.log("[initializeProvider] LoggedAs:", loggedAs);

                // Otteniamo il signer
                const signer = await getSigner();
                console.log("[initializeProvider] Signer:", signer);

                // Creiamo i contratti direttamente con il signer
                const _playlistContract = new Contract(playlistAddress, playlistABI, signer);
                const _scheduleLiveContract = new Contract(scheduleLiveAddress, scheduleLiveABI, signer);

                setPlaylistContract(_playlistContract);
                setScheduleLiveContract(_scheduleLiveContract);

                //TODO: Controllare se l'utente ha il SBT
                const userHasSBT = true;
                if (!userHasSBT) {
                    setIsConnected(false);
                    setUserHasSBT(false);
                    return;
                }

                setIsConnected(true);
                console.log("[initializeProvider] Contracts initialized with signer");
            } catch (error) {
                console.error("[initializeProvider] Error:", error);
                setIsConnected(false);
            }
        }
    }, [loggedAs, getSigner]);

    // Aggiungiamo un effetto per reinizializzare i contratti quando cambia il provider
    useEffect(() => {
        if (loggedAs) {
            initializeProvider();
        }
    }, [loggedAs, initializeProvider]);

    const fetchPlaylist = useCallback(async () => {
        const provider = getProvider();
        if (playlistContract && provider) {
            try {
                const playlistIds = await playlistContract.viewPlaylist();
                const playlistData = await Promise.all(
                    playlistIds.map(async (id: any) => {
                        const song = await playlistContract.getSongDetails(id);
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
                setPlaylist(playlistData.filter((song) => song)); // Filter out inactive songs
                setRadioModality(RadioMode.PLAYLIST);
                setLiveStreamPlatform(LiveStreamPlatform.NOT_SPECIFIED);
            } catch (error) {
                console.error("Error fetching playlist:", error);
                setPlaylist([]);
                setRadioModality(RadioMode.PLAYLIST);
                setLiveStreamPlatform(LiveStreamPlatform.NOT_SPECIFIED);
            }
        }
    }, [playlistContract]);

    // Fetch user's submitted songs
    const fetchUserSongs = useCallback(async () => {
        const provider = getProvider();
        if (playlistContract && provider) {
            try {
                const userAddress = loggedAs;
                const userSongIds = await playlistContract.getUserSongs(userAddress);
                let userSongs = await Promise.all(
                    userSongIds.map(async (id: any) => {
                        const song = await playlistContract.getSongDetails(id);
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
    }, [playlistContract, getProvider]);

    const fetchMySaves = useCallback(async () => {
        const provider = getProvider();

        if (playlistContract && provider) {
            try {
                console.log("Fetching saved song IDs...");
                const savedSongIds = await playlistContract.retrieveMySaves();
                // Fetch details for each saved song
                const formattedSaves = await Promise.all(
                    savedSongIds.map(async (id: any) => {
                        const song = await playlistContract.songsById(id);
                        return {
                            id: `p-${song.id.toString()}`,
                            title: song.title,
                            uri: song.uri,
                            img: song.img,
                            isActive: song.isActive, // Respect active status
                        };
                    })
                );
                setSavedSongs(formattedSaves.filter((song) => song.isActive)); // Exclude inactive songs
            } catch (error) {
                console.error("Error fetching my saves:", error);
                setSavedSongs([]);
            }
        }
    }, [playlistContract]);

    //TODO: Implement this!
    const fetchLiveSong = useCallback(async () => {
        console.log("[fetchLiveSong] Fetching live song");
        try {
            const provider = getProvider();
            if (scheduleLiveContract && provider) {
                const onAirInformation = await scheduleLiveContract.onAirNow();
                let isOnAir = onAirInformation["0"]
                if (isOnAir) {
                    const liveSong: Song = {
                        id: `l-${onAirInformation["1"]["0"].toString()}`,
                        title: onAirInformation["1"]["1"],
                        img: onAirInformation["1"]["2"],
                        uri: onAirInformation["1"]["3"],
                        submitter: onAirInformation["1"]["6"]
                    }
                    console.log("[fetchLiveSong] Live song in this moment:", liveSong);

                    if (playlist.length === 0 || playlist[0].id !== liveSong.id) {
                        console.log("[fetchLiveSong] Aggiornamento della live song");
                        setPlaylist([liveSong]);
                        setLiveStreamPlatform(getLivePlatformFromUri(liveSong.uri));
                        console.log("[fetchLiveSong] Live stream platform:", liveStreamPlatform);
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
    }, [scheduleLiveContract, playlist]);

    const removeSubmittedUserSong = useCallback(async (id: any) => {
        const songId = id.replace("p-", ""); //This is for de-sync playlist and liveschedule SC (id policy)
        const provider = getProvider();
        if (playlistContract && provider) {
            const tx = await playlistContract.removeOwnSong(songId);
            await tx.wait();
            fetchUserSongs();
        }
    }, [playlistContract]);

    const removeSavedSong = useCallback(async (id: any) => {
        const songId = id.replace("p-", ""); //This is for de-sync playlist and liveschedule SC (id policy)
        console.log("[removeSavedSong] Song ID to remove:", songId);
        const provider = getProvider();
        if (playlistContract && provider) {
            const tx = await playlistContract.removeFromMySaves(songId);
            await tx.wait();
            fetchMySaves();
        }
    }, [playlistContract]);

    const saveSongToMySaves = useCallback(async (id: any) => {
        const songId = id.replace("p-", ""); //This is for de-sync playlist and liveschedule SC (id policy)
        const provider = getProvider();
        if (playlistContract && provider) {
            const tx = await playlistContract.addToMySaves(songId);
            await tx.wait();
            fetchMySaves();
        }
    }, [playlistContract]);

    const fetchBookedSlots = useCallback(async () => {
        const provider = getProvider();
        if (scheduleLiveContract && provider) {
            try {
                const eventIds = await scheduleLiveContract.getMyBookedShows();
                const events = await Promise.all(
                    eventIds.map(async (eventId: any) => {
                        const event = await scheduleLiveContract.getEventDetails(eventId);
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
    }, [scheduleLiveContract]);

    const fetchNext24HoursEvents = useCallback(async () => {
        const provider = getProvider();
        if (scheduleLiveContract && provider) {
            try {
                const eventIds = await scheduleLiveContract.getLiveShowsInNext24Hours();
                const events = await Promise.all(
                    eventIds.map(async (eventId: any) => {
                        const event = await scheduleLiveContract.getEventDetails(eventId);
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
    }, [scheduleLiveContract]);

    const scheduleLive = useCallback(async (title: string, imageUrl: string, streamUrl: string, startTime: number, duration: number) => {
        const provider = getProvider();
        if (scheduleLiveContract && provider) {
            const tx = await scheduleLiveContract.scheduleEvent(title, imageUrl, streamUrl, startTime, duration);
            await tx.wait();
            fetchBookedSlots();
            fetchNext24HoursEvents();
        }
    }, [scheduleLiveContract]);

    const deleteScheduledEvent = useCallback(async (eventId: any) => {
        const provider = getProvider();
        if (scheduleLiveContract && provider) {
            const tx = await scheduleLiveContract.deleteEvent(eventId);
            await tx.wait();
            fetchBookedSlots();
            fetchNext24HoursEvents();
        }
    }, [scheduleLiveContract]);

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
        if (playlistContract) {
            fetchStaticData();
            const cleanup = fetchAllData();
            return () => {
                cleanup.then(cleanupFn => cleanupFn());
            };
        }
    }, [playlistContract, fetchStaticData, fetchAllData]);

    return (
        <Web3RadioContext.Provider
            value={{
                playlistContract,
                playlist,
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
