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
        songsById[songId].isActive = false;
        removeSongFromUser(msg.sender, songId);
    }

    function addToMySaves(uint _id) external onlyNFTHolder validSongId(_id) {
        for (uint i = 0; i < userSaves[msg.sender].length; i++) {
            require(userSaves[msg.sender][i] != _id, "Song already saved");
        }
        userSaves[msg.sender].push(_id); // Save the song ID for the user
        songScores[_id]++;               // Increment the song score
    }

    // Simplified Getter Functions

    function retrieveMySaves() external view returns (uint[] memory) {
        return userSaves[msg.sender];
    }

    function viewPlaylist() external view returns (uint[] memory) {
        uint[] memory playlistIds = new uint[](nextSongId);
        uint count;

        for (uint i = 0; i < nextSongId; i++) {
            playlistIds[count] = i;
            count++;
        }

        uint[] memory result = new uint[](count);
        for (uint i = 0; i < count; i++) {
            result[i] = playlistIds[i];
        }
        return result;
    }

    function getUserSongs(address user) external view returns (uint[] memory) {
        return userSongs[user];
    }

    function getSongDetails(uint songId) external view validSongId(songId) returns (Song memory) {
        return songsById[songId];
    }
}
