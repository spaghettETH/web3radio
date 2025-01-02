// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DecentraPlaylist is Ownable {
    IERC721 public nftContract;

    uint public nextSongId; // Counter for unique song IDs

    struct Song {
        uint id;  // Unique ID for each song
        string uri;
        string img;
        string title;
        address submitter;
    }

    mapping(uint => Song) public songsById;  // Map ID to song
    mapping(address => uint[]) public userSongs; // Songs submitted by each user

    Song[] public playlist; // Shared playlist array
    mapping(address => bool) public whitelist; // Whitelisted addresses

    // Mappings for saves and scores
    mapping(address => uint[]) public userSaves; // Map user to saved song IDs
    mapping(uint => uint) public songScores;     // Map song ID to score (save count)

    constructor(address _nftContract) {
        nftContract = IERC721(_nftContract);
    }

    modifier onlyNFTHolder() {
        require(nftContract.balanceOf(msg.sender) > 0, "Must own an NFT to interact");
        _;
    }

    modifier validSongId(uint _id) {
        require(_id < playlist.length, "Invalid song ID");
        _;
    }

    function addSong(string memory uri, string memory img, string memory title) external onlyNFTHolder {
        Song memory newSong = Song({
            id: nextSongId,  // Assign the unique ID
            uri: uri,
            img: img,
            title: title,
            submitter: msg.sender
        });

        playlist.push(newSong);
        songsById[nextSongId] = newSong; // Add to mapping
        userSongs[msg.sender].push(nextSongId); // Track songs per user
        nextSongId++;
    }

    // Add song to user's saved list
    function addToMySaves(uint _id) external onlyNFTHolder validSongId(_id) {
        // Ensure the song hasn't already been saved
        for (uint i = 0; i < userSaves[msg.sender].length; i++) {
            require(userSaves[msg.sender][i] != _id, "Song already saved");
        }

        userSaves[msg.sender].push(_id); // Save the song ID for the user
        songScores[_id]++;               // Increment the song score
    }

    // Retrieve all saved songs for the caller
    function retrieveMySaves() external view returns (Song[] memory) {
        uint[] memory savedIds = userSaves[msg.sender];
        Song[] memory savedSongs = new Song[](savedIds.length);

        for (uint i = 0; i < savedIds.length; i++) {
            savedSongs[i] = playlist[savedIds[i]];
        }

        return savedSongs;
    }

    // Retrieve the most saved songs (leaderboard)
    function mostSaved() external view returns (Song[] memory, uint[] memory) {
        uint songCount = playlist.length;
        Song[] memory topSongs = new Song[](songCount);
        uint[] memory scores = new uint[](songCount);

        for (uint i = 0; i < songCount; i++) {
            topSongs[i] = playlist[i];
            scores[i] = songScores[i];
        }

        // Sort songs by scores (bubble sort for demonstration purposes)
        for (uint i = 0; i < songCount; i++) {
            for (uint j = i + 1; j < songCount; j++) {
                if (scores[j] > scores[i]) {
                    // Swap scores
                    uint tempScore = scores[i];
                    scores[i] = scores[j];
                    scores[j] = tempScore;

                    // Swap songs
                    Song memory tempSong = topSongs[i];
                    topSongs[i] = topSongs[j];
                    topSongs[j] = tempSong;
                }
            }
        }

        return (topSongs, scores);
    }

    // User can remove their own songs only
    function removeOwnSong(uint songId) external {
        require(songId < playlist.length, "Invalid song ID");
        require(playlist[songId].submitter == msg.sender, "Not authorized to remove this song");

        // Remove from the playlist array
        if (songId != playlist.length - 1) {
            // Swap the song with the last song in the array
            playlist[songId] = playlist[playlist.length - 1];
        }
        playlist.pop(); // Remove the last element

        // Remove the song from the songsById mapping
        delete songsById[songId];

        // Remove the song from user's saved list (optional)
        uint[] storage saves = userSaves[msg.sender];
        for (uint i = 0; i < saves.length; i++) {
            if (saves[i] == songId) {
                saves[i] = saves[saves.length - 1]; // Replace with the last element
                saves.pop(); // Remove the last element
                break;
            }
        }
    }


    // Whitelisted addresses can remove any song
    function removeAnySong(uint index) external {
        require(whitelist[msg.sender], "Not authorized to remove any song");
        require(index < playlist.length, "Invalid index");

        playlist[index] = playlist[playlist.length - 1];
        playlist.pop();
    }

    // Manage Whitelist
    function addToWhitelist(address user) external onlyOwner {
        whitelist[user] = true;
    }

    function removeFromWhitelist(address user) external onlyOwner {
        whitelist[user] = false;
    }

    // View the playlist without shuffle
    function viewPlaylist()
    external
    view
    returns (
        string[] memory uris,
        string[] memory imgs,
        string[] memory titles,
        address[] memory submitters
    )
{
    uint length = playlist.length;
    uris = new string[](length);
    imgs = new string[](length);
    titles = new string[](length);
    submitters = new address[](length);

    for (uint i = 0; i < length; i++) {
        uris[i] = playlist[i].uri;
        imgs[i] = playlist[i].img;
        titles[i] = playlist[i].title;
        submitters[i] = playlist[i].submitter;
    }

    return (uris, imgs, titles, submitters);
}


    function getUserSongs(address user) external view returns (uint[] memory) {
        return userSongs[user];
    }
}
