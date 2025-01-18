
interface LeaderboardTableProps {
    leaderboard: any[];
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ leaderboard }) => {

    const resolveIpfsUri = (uri: string) => {
        if (!uri) {
            console.error("Invalid URI:", uri);
            return undefined;
        }
        return uri.startsWith("ipfs://")
            ? `https://dweb.link/ipfs/${uri.slice(7)}`
            : uri;
    };

    return (
        <div className="w-full bg-black p-6 overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="my-2">
                        <th className="text-left text-white uppercase text-[#868686] pr-2">
                            <div className="flex flex-row items-center justify-start">
                                Title
                            </div>
                        </th>
                        <th className="text-left text-white uppercase text-[#868686] px-2">
                            <div className="flex flex-row items-center justify-center">
                                Saves
                            </div>
                        </th>
                        <th className="text-left text-white uppercase text-[#868686] px-2">
                            <div className="flex flex-row items-center justify-center">
                                Play
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        leaderboard.map((song) => (
                            <tr key={song.id} className="border-b border-1 border-[#2b2b2b] py-2">
                                <td className="flex justify-start sm:flex-row text-white flex items-center gap-2">
                                    <img src={song.img ?? "/mp3_placeholder.jpg"} alt={song.title} className="w-8 h-8 rounded-sm" />
                                    <div className="overflow-hidden relative flex-1 mr-2 group">
                                        <h1 className="text-white uppercase font-bold whitespace-nowrap group-hover:animate-scrollText inline-block">
                                            {song.title}
                                        </h1>
                                    </div>
                                </td>
                                <td className="text-white">
                                    <div className="flex flex-row items-center justify-center">
                                        {song.score}
                                    </div>
                                </td>
                                <td className="text-white">
                                    <div className="flex flex-row items-center justify-center">
                                        <a className="flex items-center gap-2" href={resolveIpfsUri(song.uri)} target="_blank" rel="noopener noreferrer">
                                            <img src="/headphone.svg" alt="play" className="w-4 h-4" />
                                            <span className="text-white uppercase sm:block hidden">Listen now</span>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div >
    )
}   

export default LeaderboardTable;