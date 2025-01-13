// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DecentraLiveSchedule is Ownable {
    IERC721 public nftContract;

    uint256 public constant SLOT_DURATION = 1800; // 30 minutes in seconds
    uint256 public constant MAX_BOOKINGS_PER_DAY = 3; // Maximum bookings allowed per user in 24 hours
    mapping(uint256 => address) public slotToOwner; // Maps slot timestamp to the owner's address
    mapping(uint256 => uint256) public slotToEventId; // Maps slot timestamp to event ID
    mapping(address => uint256) public lastBookingTime; // A: Tracks last booking timestamp
    mapping(address => uint256) public dailyBookingCount; // B: Tracks booking count in last 24 hours


    struct LiveEvent {
        uint256 id;
        string title;
        string imageUrl;
        string livestreamUrl;
        uint256 startTime;
        uint256 endTime;
        address creator;
        bool isActive; // Indicates if the event is active
    }

    mapping(uint256 => LiveEvent) public eventsById; // Maps event ID to details
    mapping(address => uint256[]) public userEvents; // Tracks user-created event IDs
    uint256 public nextEventId; // Counter for unique event IDs

    event EventScheduled(uint256 indexed id, uint256 indexed startTime, address indexed creator);
    event EventDeleted(uint256 indexed id, address indexed creator);

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

    modifier enforceDailyBookingLimit() {
        uint256 currentTime = block.timestamp;

        // If more than 24 hours have passed since the last booking, reset the counter
        if (currentTime > lastBookingTime[msg.sender] + 1 days) {
            dailyBookingCount[msg.sender] = 0;
            lastBookingTime[msg.sender] = currentTime;
        }

        // Check if the user has exceeded their daily booking limit
        require(
            dailyBookingCount[msg.sender] < MAX_BOOKINGS_PER_DAY,
            "Too many bookings for today!"
        );

        _;
    }

    function scheduleEvent(
        string memory title,
        string memory imageUrl,
        string memory livestreamUrl,
        uint256 slot,
        uint256 slotCount
    ) external onlyNFTHolder validSlot(slot) enforceDailyBookingLimit {
        require(slotCount > 0, "Slot count must be greater than zero");
        require(bytes(title).length > 0, "Title is required");
        require(bytes(imageUrl).length > 0, "Image URL is required");
        require(bytes(livestreamUrl).length > 0, "Livestream URL is required");
        require(slotCount <= 10, "Cannot book more than 10 slots (5 hours) in a single booking");


        uint256 endTime = slot + (slotCount * SLOT_DURATION);

        for (uint256 i = 0; i < slotCount; i++) {
            uint256 currentSlot = slot + (i * SLOT_DURATION);
            require(slotToOwner[currentSlot] == address(0), "One or more slots are already booked");
        }

        LiveEvent memory newEvent = LiveEvent({
            id: nextEventId,
            title: title,
            imageUrl: imageUrl,
            livestreamUrl: livestreamUrl,
            startTime: slot,
            endTime: endTime,
            creator: msg.sender,
            isActive: true
        });

        for (uint256 i = 0; i < slotCount; i++) {
            uint256 currentSlot = slot + (i * SLOT_DURATION);
            slotToOwner[currentSlot] = msg.sender;
            slotToEventId[currentSlot] = nextEventId;
        }

        eventsById[nextEventId] = newEvent;
        userEvents[msg.sender].push(nextEventId);

        // Update the daily booking count
        dailyBookingCount[msg.sender]++;
        lastBookingTime[msg.sender] = block.timestamp;


        emit EventScheduled(nextEventId, slot, msg.sender);

        nextEventId++;
    }

    function deleteEvent(uint256 eventId) external {
        require(eventId < nextEventId, "Invalid event ID");
        LiveEvent storage eventDetails = eventsById[eventId];
        require(eventDetails.creator == msg.sender, "Only the creator can delete this event");
        require(eventDetails.isActive, "Event is already inactive");

        eventDetails.isActive = false;

        for (uint256 slot = eventDetails.startTime; slot < eventDetails.endTime; slot += SLOT_DURATION) {
            delete slotToOwner[slot];
            delete slotToEventId[slot];
        }

        emit EventDeleted(eventId, msg.sender);
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
        uint256 currentSlot = block.timestamp - (block.timestamp % SLOT_DURATION); // Align to the current slot

        // Check if the current slot is mapped to an event
        uint256 eventId = slotToEventId[currentSlot];
        if (slotToOwner[currentSlot] != address(0)) {
            LiveEvent memory eventDetails = eventsById[eventId];
            if (eventDetails.isActive) {
                return (true, eventDetails);
            }
        }

        // Return no active event if no match
        return (false, LiveEvent(0, "", "", "", 0, 0, address(0), false));
    }

    function getLiveShowsInNext24Hours() external view returns (uint256[] memory) {
        uint256 currentSlot = block.timestamp - (block.timestamp % SLOT_DURATION); // Align to the current slot
        uint256 slotsToCheck = (24 * 60 * 60) / SLOT_DURATION; // Number of 30-minute slots in 24 hours
        uint256[] memory eventIds = new uint256[](slotsToCheck);
        uint256 count = 0;

        for (uint256 i = 0; i < slotsToCheck; i++) {
            uint256 slot = currentSlot + (i * SLOT_DURATION);
            if (slotToOwner[slot] != address(0)) { // Check if the slot is booked
                uint256 eventId = slotToEventId[slot];
                LiveEvent memory eventDetails = eventsById[eventId];
                if (eventDetails.isActive && !existsInArray(eventIds, eventId, count)) {
                    eventIds[count] = eventId;
                    count++;
                }
            }
        }

        // Resize the array to the exact number of events
        uint256[] memory filteredEventIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            filteredEventIds[i] = eventIds[i];
        }

        return filteredEventIds;
    }

    function existsInArray(uint256[] memory array, uint256 value, uint256 length) private pure returns (bool) {
        for (uint256 i = 0; i < length; i++) {
            if (array[i] == value) {
                return true;
            }
        }
        return false;
    }



}
