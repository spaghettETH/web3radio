export default function LeaderboardTable({ leaderboard }) {

    const resolveIpfsUri = (uri) => {
        if (!uri) {
            console.error("Invalid URI:", uri);
            return null;
        }
        return uri.startsWith("ipfs://")
            ? `https://dweb.link/ipfs/${uri.slice(7)}`
            : uri;
    };

    return (
        <div className="w-full bg-black p-6">
            <table className="min-w-full">
                <thead>
                    <tr className="my-2">
                        <th className="text-left text-white uppercase text-[#868686]">Title</th>
                        <th className="text-left text-white uppercase text-[#868686]">Saves</th>
                        <th className="text-left text-white uppercase text-[#868686]">Play</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        leaderboard.map((song) => (
                            <tr key={song.id} className="border-b border-1 border-[#2b2b2b] py-2">
                                <td className="text-white flex items-center gap-2">
                                    <img src={song.img} alt={song.title} className="w-8 h-8 rounded-sm" />
                                    {song.title}
                                </td>
                                <td className="text-white">{song.score}</td>
                                <td className="text-white"><a href={resolveIpfsUri(song.uri)} target="_blank" rel="noopener noreferrer">Listen</a></td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}   