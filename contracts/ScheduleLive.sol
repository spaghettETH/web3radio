// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DecentraLiveSchedule is Ownable {
    IERC721 public nftContract;

    uint256 public constant SLOT_DURATION = 1800; // 30 minutes in seconds
    mapping(uint256 => address) public slotToOwner; // Maps slot timestamp to the owner's address
    mapping(uint256 => uint256) public slotToEventId; // Maps slot timestamp to event ID

    struct LiveEvent {
        uint256 id;
        string title;
        string imageUrl;
        string livestreamUrl;
        uint256 startTime; // Start time of the event
        uint256 endTime;   // End time of the event
        address creator;   // Creator of the event
    }

    mapping(uint256 => LiveEvent) public eventsById; // Maps event ID to details
    mapping(address => uint256[]) public userEvents; // Tracks user-created event IDs
    uint256 public nextEventId; // Counter for unique event IDs

    event EventScheduled(uint256 indexed id, uint256 indexed startTime, address indexed creator);

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

    modifier validSlot(uint256 slot) {
        require(slot % SLOT_DURATION == 0, "Slot must align with 30-minute intervals");
        require(slot > block.timestamp, "Slot must be in the future");
        require(slotToOwner[slot] == address(0), "Slot is already booked");
        _;
    }

    function scheduleEvent(
        string memory title,
        string memory imageUrl,
        string memory livestreamUrl,
        uint256 slot,
        uint256 slotCount
    ) external onlyNFTHolder validSlot(slot) {
        require(slotCount > 0, "Slot count must be greater than zero");
        require(bytes(title).length > 0, "Title is required");
        require(bytes(imageUrl).length > 0, "Image URL is required");
        require(bytes(livestreamUrl).length > 0, "Livestream URL is required");

        uint256 endTime = slot + (slotCount * SLOT_DURATION); // Calculate event end time

        // Check that all slots in the range are available
        for (uint256 i = 0; i < slotCount; i++) {
            uint256 currentSlot = slot + (i * SLOT_DURATION);
            require(slotToOwner[currentSlot] == address(0), "One or more slots are already booked");
        }

        // Create the event
        LiveEvent memory newEvent = LiveEvent({
            id: nextEventId,
            title: title,
            imageUrl: imageUrl,
            livestreamUrl: livestreamUrl,
            startTime: slot,
            endTime: endTime, // Set the end time
            creator: msg.sender
        });

        // Book all slots and map them to the event
        for (uint256 i = 0; i < slotCount; i++) {
            uint256 currentSlot = slot + (i * SLOT_DURATION);
            slotToOwner[currentSlot] = msg.sender;
            slotToEventId[currentSlot] = nextEventId;
        }

        // Store the event and update user mapping
        eventsById[nextEventId] = newEvent;
        userEvents[msg.sender].push(nextEventId);

        emit EventScheduled(nextEventId, slot, msg.sender);

        nextEventId++;
    }

    function getMyBookedShows() external view returns (uint256[] memory) {
        return userEvents[msg.sender];
    }

    function getAllEventIds() external view returns (uint256[] memory) {
        uint256[] memory allEventIds = new uint256[](nextEventId);

        for (uint256 i = 0; i < nextEventId; i++) {
            allEventIds[i] = i;
        }

        return allEventIds;
    }

    function getEventDetails(uint256 eventId) external view returns (LiveEvent memory) {
        require(eventId < nextEventId, "Invalid event ID");
        return eventsById[eventId];
    }

    function onAirNow() external view returns (bool, LiveEvent memory) {
        uint256 currentTime = block.timestamp;

        for (uint256 i = 0; i < nextEventId; i++) {
            LiveEvent memory eventDetails = eventsById[i];
            if (
                eventDetails.startTime <= currentTime &&
                eventDetails.endTime > currentTime
            ) {
                return (true, eventDetails);
            }
        }

        return (false, LiveEvent(0, "", "", "", 0, 0, address(0)));
    }
}
