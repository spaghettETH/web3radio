// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract DecentraPlaylist is Ownable {
    IERC721 public nftContract;

    uint public nextSongId = 1; // Start IDs from 1

    struct Song {
        uint id; // Unique ID for each song
        string uri;
        string img;
        string title;
        bytes32 tag; // Added tag for categorization
        address submitter;
        bool isActive; // Indicates if the song is active
    }

    mapping(uint => Song) public songsById; // Map ID to song
    mapping(address => uint[]) public userSongs; // Songs submitted by each user
    mapping(address => uint[]) public userSaves; // Map user to saved song IDs
    mapping(uint => uint) public songScores; // Map song ID to score (save count)
    mapping(address => bool) public isProxy;
    mapping(bytes32 => uint[]) public songIDsByTag; // Map tag to list of song IDs

    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
    }

    modifier validSongId(uint _id) {
        require(_id > 0 && _id < nextSongId, "Invalid song ID");
        _;
    }

    modifier onlyNFTHolderOrProxy() {
        require(
            nftContract.balanceOf(msg.sender) > 0 || isProxy[msg.sender],
            "Must own an NFT or be a proxy"
        );
        _;
    }

    function setProxyAddress(address _proxy, bool _state) external onlyOwner {
        isProxy[_proxy] = _state;
    }

    function returnSubmitter(
        bytes memory signature,
        bytes memory proof
    ) internal pure returns (address) {
        bytes32 hashed = MessageHashUtils.toEthSignedMessageHash(proof);
        return ECDSA.recover(hashed, signature);
    }

    function addSong(
        string memory uri,
        string memory img,
        string memory title,
        bytes32 tag, // Added tag parameter
        bytes memory signature
    ) external onlyNFTHolderOrProxy {
        address submitter = msg.sender;
        if (isProxy[msg.sender]) {
            submitter = returnSubmitter(
                signature,
                abi.encodePacked("Add song: ", uri)
            );
            require(
                nftContract.balanceOf(submitter) > 0,
                "User must own an NFT"
            );
        }
        Song memory newSong = Song({
            id: nextSongId,
            uri: uri,
            img: img,
            title: title,
            tag: tag,
            submitter: submitter,
            isActive: true
        });

        songsById[nextSongId] = newSong; // Add to mapping
        userSongs[msg.sender].push(nextSongId); // Track songs per user
        songIDsByTag[tag].push(nextSongId); // Add song ID to tag mapping
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
        require(
            songsById[songId].submitter == msg.sender,
            "Not authorized to remove this song"
        );
        songsById[songId].isActive = false;
        removeSongFromUser(msg.sender, songId);
    }

    function addToMySaves(
        uint _id,
        bytes memory signature
    ) external onlyNFTHolderOrProxy validSongId(_id) {
        address submitter = msg.sender;
        if (isProxy[msg.sender]) {
            submitter = returnSubmitter(
                signature,
                abi.encodePacked("Add to my saves: ", _id)
            );
            require(
                nftContract.balanceOf(submitter) > 0,
                "User must own an NFT"
            );
        }
        for (uint i = 0; i < userSaves[submitter].length; i++) {
            require(userSaves[submitter][i] != _id, "Song already saved");
        }
        userSaves[submitter].push(_id); // Save the song ID for the user
        songScores[_id]++; // Increment the song score
    }

    function removeFromMySaves(
        uint _id,
        bytes memory signature
    ) external onlyNFTHolderOrProxy validSongId(_id) {
        address submitter = msg.sender;
        if (isProxy[msg.sender]) {
            submitter = returnSubmitter(
                signature,
                abi.encodePacked("Remove from my saves: ", _id)
            );
            require(
                nftContract.balanceOf(submitter) > 0,
                "User must own an NFT"
            );
        }
        uint[] storage saves = userSaves[submitter];
        for (uint i = 0; i < saves.length; i++) {
            if (saves[i] == _id) {
                saves[i] = 0; // Mark as removed
                break;
            }
        }
        if (songScores[_id] > 0) {
            songScores[_id]--; // Decrement the song's score
        }
    }

    // Getter function to retrieve all song IDs for a given tag
    function getSongsByTag(bytes32 tag) external view returns (uint[] memory) {
        return songIDsByTag[tag];
    }

    // Simplified Getter Functions

    function retrieveMySaves(
        address user
    ) external view returns (uint[] memory) {
        return userSaves[user];
    }

    function viewPlaylist() external view returns (uint[] memory) {
        uint[] memory playlistIds = new uint[](nextSongId - 1);
        uint count;

        for (uint i = 1; i < nextSongId; i++) {
            // Start from 1
            if (songsById[i].isActive) {
                playlistIds[count] = i;
                count++;
            }
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

    function getSongDetails(
        uint songId
    ) external view validSongId(songId) returns (Song memory) {
        return songsById[songId];
    }
}
