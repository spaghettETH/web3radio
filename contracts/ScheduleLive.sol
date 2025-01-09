// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DecentraLiveSchedule is Ownable {
    IERC721 public nftContract;

    uint256 public nextEventId;

    struct LiveEvent {
        uint256 id;
        string title;
        string imageUrl;
        string livestreamUrl;
        uint256 startTime;
        uint256 duration;
        address creator;
    }

    mapping(uint256 => LiveEvent) public eventsById;
    mapping(uint256 => bool) public isSlotTaken;
    mapping(address => uint256[]) public userEvents;

    LiveEvent[] public events;

    constructor(address _nftContract) {
        nftContract = IERC721(_nftContract);
    }

    modifier onlyNFTHolder() {
        require(
            nftContract.balanceOf(msg.sender) > 0,
            "Must own an NFT to schedule live events"
        );
        _;
    }

    modifier validEventId(uint256 eventId) {
        require(eventId < nextEventId, "Invalid event ID");
        _;
    }

    function scheduleEvent(
        string memory title,
        string memory imageUrl,
        string memory livestreamUrl,
        uint256 startTime,
        uint256 duration
    ) external onlyNFTHolder {
        require(bytes(title).length > 0, "Title is required");
        require(bytes(imageUrl).length > 0, "Image URL is required");
        require(bytes(livestreamUrl).length > 0, "Livestream URL is required");
        require(startTime > block.timestamp, "Start time must be in the future");
        require(
            duration == 15 * 60 || duration == 30 * 60 || duration == 60 * 60,
            "Invalid duration"
        );

        uint256 endTime = startTime + duration;
        for (uint256 time = startTime; time < endTime; time += 60) {
            require(!isSlotTaken[time], "Slot is already booked");
        }

        for (uint256 time = startTime; time < endTime; time += 60) {
            isSlotTaken[time] = true;
        }

        LiveEvent memory newEvent = LiveEvent({
            id: nextEventId,
            title: title,
            imageUrl: imageUrl,
            livestreamUrl: livestreamUrl,
            startTime: startTime,
            duration: duration,
            creator: msg.sender
        });

        events.push(newEvent);
        eventsById[nextEventId] = newEvent;
        userEvents[msg.sender].push(nextEventId);

        nextEventId++;
    }
    // Get user's shows
    function getMyBookedShows() external view returns (
    uint256[] memory ids,
    string[] memory titles,
    string[] memory imageUrls,
    string[] memory livestreamUrls,
    uint256[] memory startTimes,
    uint256[] memory durations,
    address[] memory creators
) {
    uint256[] memory myEventIds = userEvents[msg.sender];
    uint256 count = myEventIds.length;

    ids = new uint256[](count);
    titles = new string[](count);
    imageUrls = new string[](count);
    livestreamUrls = new string[](count);
    startTimes = new uint256[](count);
    durations = new uint256[](count);
    creators = new address[](count);

    for (uint256 i = 0; i < count; i++) {
        LiveEvent storage eventDetail = eventsById[myEventIds[i]];
        ids[i] = eventDetail.id;
        titles[i] = eventDetail.title;
        imageUrls[i] = eventDetail.imageUrl;
        livestreamUrls[i] = eventDetail.livestreamUrl;
        startTimes[i] = eventDetail.startTime;
        durations[i] = eventDetail.duration;
        creators[i] = eventDetail.creator;
    }
}

    
    // Simplified getter for all events
    function getAllEventsSimplified()
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory titles,
            string[] memory imageUrls,
            string[] memory livestreamUrls,
            uint256[] memory startTimes,
            uint256[] memory durations,
            address[] memory creators
        )
    {
        uint256 eventCount = events.length;

        ids = new uint256[](eventCount);
        titles = new string[](eventCount);
        imageUrls = new string[](eventCount);
        livestreamUrls = new string[](eventCount);
        startTimes = new uint256[](eventCount);
        durations = new uint256[](eventCount);
        creators = new address[](eventCount);

        for (uint256 i = 0; i < eventCount; i++) {
            LiveEvent memory liveEvent = events[i];
            ids[i] = liveEvent.id;
            titles[i] = liveEvent.title;
            imageUrls[i] = liveEvent.imageUrl;
            livestreamUrls[i] = liveEvent.livestreamUrl;
            startTimes[i] = liveEvent.startTime;
            durations[i] = liveEvent.duration;
            creators[i] = liveEvent.creator;
        }
    }

    function onAirNow()
        external
        view
        returns (bool, LiveEvent memory)
    {
        uint256 currentTime = block.timestamp;

        for (uint256 i = 0; i < events.length; i++) {
            if (
                events[i].startTime <= currentTime &&
                (events[i].startTime + events[i].duration) > currentTime
            ) {
                return (true, events[i]);
            }
        }

        return (false, LiveEvent(0, "", "", "", 0, 0, address(0)));
    }
}
