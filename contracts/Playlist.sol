// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DecentraPlaylist is Ownable {
    IERC721 public nftContract;

    uint public nextSongId; // Counter for unique song IDs

    struct Song {
        uint id;          // Unique ID for each song
        string uri;
        string img;
        string title;
        address submitter;
        bool isActive;    // Indicates if the song is active
    }

    mapping(uint => Song) public songsById;  // Map ID to song
    mapping(address => uint[]) public userSongs; // Songs submitted by each user

    Song[] public playlist; // Shared playlist array
    mapping(address => bool) public whitelist; // Whitelisted addresses

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
        require(_id < nextSongId, "Invalid song ID");
        require(songsById[_id].isActive, "Song is inactive");
        _;
    }

    function addSong(string memory uri, string memory img, string memory title) external onlyNFTHolder {
        Song memory newSong = Song({
            id: nextSongId,
            uri: uri,
            img: img,
            title: title,
            submitter: msg.sender,
            isActive: true
        });

        playlist.push(newSong);
        songsById[nextSongId] = newSong; // Add to mapping
        userSongs[msg.sender].push(nextSongId); // Track songs per user
        nextSongId++;
    }

    function removeSongFromUser(address user, uint songId) internal {
        uint[] storage userSongsArray = userSongs[user];
        for (uint i = 0; i < userSongsArray.length; i++) {
            if (userSongsArray[i] == songId) {
                userSongsArray[i] = userSongsArray[userSongsArray.length - 1]; // Replace with the last element
                userSongsArray.pop(); // Remove the last element
                break;
            }
        }
    }

    function removeOwnSong(uint songId) external validSongId(songId) {
        require(songsById[songId].submitter == msg.sender, "Not authorized to remove this song");

        // Mark song as inactive
        songsById[songId].isActive = false;

        // Remove from userSongs
        removeSongFromUser(msg.sender, songId);
    }

    function removeAnySong(uint songId) external validSongId(songId) {
        require(whitelist[msg.sender], "Not authorized to remove any song");

        // Mark song as inactive
        songsById[songId].isActive = false;

        // Remove from userSongs
        address submitter = songsById[songId].submitter;
        removeSongFromUser(submitter, songId);
    }

    function addToMySaves(uint _id) external onlyNFTHolder validSongId(_id) {
        for (uint i = 0; i < userSaves[msg.sender].length; i++) {
            require(userSaves[msg.sender][i] != _id, "Song already saved");
        }

        userSaves[msg.sender].push(_id); // Save the song ID for the user
        songScores[_id]++;               // Increment the song score
    }

    function retrieveMySaves() external view returns (Song[] memory) {
        uint[] memory savedIds = userSaves[msg.sender];
        uint activeCount;
        for (uint i = 0; i < savedIds.length; i++) {
            if (songsById[savedIds[i]].isActive) {
                activeCount++;
            }
        }

        Song[] memory savedSongs = new Song[](activeCount);
        uint j;
        for (uint i = 0; i < savedIds.length; i++) {
            if (songsById[savedIds[i]].isActive) {
                savedSongs[j] = songsById[savedIds[i]];
                j++;
            }
        }

        return savedSongs;
    }

    function mostSaved() external view returns (Song[] memory, uint[] memory) {
        uint activeCount;
        for (uint i = 0; i < playlist.length; i++) {
            if (playlist[i].isActive) {
                activeCount++;
            }
        }

        Song[] memory topSongs = new Song[](activeCount);
        uint[] memory scores = new uint[](activeCount);
        uint j;

        for (uint i = 0; i < playlist.length; i++) {
            if (playlist[i].isActive) {
                topSongs[j] = playlist[i];
                scores[j] = songScores[playlist[i].id];
                j++;
            }
        }

        return (topSongs, scores);
    }

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
        uint activeCount;
        for (uint i = 0; i < playlist.length; i++) {
            if (playlist[i].isActive) {
                activeCount++;
            }
        }

        uris = new string[](activeCount);
        imgs = new string[](activeCount);
        titles = new string[](activeCount);
        submitters = new address[](activeCount);

        uint j;
        for (uint i = 0; i < playlist.length; i++) {
            if (playlist[i].isActive) {
                uris[j] = playlist[i].uri;
                imgs[j] = playlist[i].img;
                titles[j] = playlist[i].title;
                submitters[j] = playlist[i].submitter;
                j++;
            }
        }

        return (uris, imgs, titles, submitters);
    }

    function getUserSongs(address user) external view returns (uint[] memory) {
        return userSongs[user];
    }

    function getPlaylistLength() public view returns (uint256) {
        return playlist.length;
    }
}
