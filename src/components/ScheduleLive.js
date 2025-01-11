import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ScheduleLive = ({ contract }) => {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [extendSlots, setExtendSlots] = useState(1); // Default to 1 slot (30 minutes)
  const [bookedSlots, setBookedSlots] = useState([]);
  const [upcomingStreams, setUpcomingStreams] = useState([]);

  const fetchBookedSlots = useCallback(async () => {
    try {
      const bookedIds = await contract.getMyBookedShows();
      const slots = await Promise.all(
        bookedIds.map(async (id) => {
          const eventDetails = await contract.getEventDetails(id);
          return {
            id: eventDetails.id,
            title: eventDetails.title,
            imageUrl: eventDetails.imageUrl,
            livestreamUrl: eventDetails.livestreamUrl,
            start: new Date(Number(eventDetails.startTime) * 1000).toLocaleString(),
            end: new Date(Number(eventDetails.endTime) * 1000).toLocaleString(),
            creator: eventDetails.creator,
          };
        })
      );

      setBookedSlots(slots);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  }, [contract]);

  const fetchUpcomingStreams = useCallback(async () => {
    try {
      const eventIds = await contract.getAllEventIds();
      const streams = await Promise.all(
        eventIds.map(async (id) => {
          const eventDetails = await contract.getEventDetails(id);
          return {
            id: eventDetails.id,
            title: eventDetails.title,
            imageUrl: eventDetails.imageUrl,
            livestreamUrl: eventDetails.livestreamUrl,
            startTime: new Date(Number(eventDetails.startTime) * 1000).toLocaleString(),
            endTime: new Date(Number(eventDetails.endTime) * 1000).toLocaleString(),
            creator: eventDetails.creator,
          };
        })
      );

      const currentTime = Math.floor(Date.now() / 1000);
      const next24Hours = currentTime + 24 * 60 * 60;

      setUpcomingStreams(
        streams.filter(
          (stream) =>
            stream.startTime >= currentTime &&
            stream.startTime <= next24Hours
        )
      );
    } catch (error) {
      console.error("Error fetching upcoming streams:", error);
    }
  }, [contract]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !imageUrl || !streamUrl || !selectedDate) {
      alert("Please fill in all fields.");
      return;
    }

    const startTime = Math.floor(selectedDate.getTime() / 1000);

    try {
      const tx = await contract.scheduleEvent(
        title,
        imageUrl,
        streamUrl,
        startTime,
        extendSlots
      );
      await tx.wait();
      alert("Livestream scheduled successfully!");
      fetchBookedSlots();
      fetchUpcomingStreams();
    } catch (error) {
      console.error("Error scheduling livestream:", error);
      alert("Failed to schedule livestream.");
    }
  };

  useEffect(() => {
    if (contract) {
      fetchBookedSlots();
      fetchUpcomingStreams();
    }
  }, [contract, fetchBookedSlots, fetchUpcomingStreams]);

  const filterTimeOptions = (date) => {
    const minutes = date.getMinutes();
    return minutes === 0 || minutes === 30; // Only allow 00 and 30 minutes
  };

  return (
    <div>
      <h2>Schedule a Live Stream</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Image URL:</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Livestream URL:</label>
          <input
            type="url"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Date and Time:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            showTimeSelect
            dateFormat="Pp"
            filterTime={filterTimeOptions} // Restrict time selection to 00 and 30 minutes
          />
        </div>
        <div>
          <label>Extend:</label>
          <select
            value={extendSlots}
            onChange={(e) => setExtendSlots(Number(e.target.value))}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1} Slot{(i + 1) > 1 ? "s" : ""} ({(i + 1) * 30} minutes)
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Schedule Livestream</button>
      </form>

      <h3>Booked Slots</h3>
      <ul>
        {bookedSlots.length > 0 ? (
          bookedSlots.map((slot, index) => (
            <li key={index}>
              {slot.start} - {slot.end}
            </li>
          ))
        ) : (
          <p>No booked slots.</p>
        )}
      </ul>

      <h3>Upcoming Livestreams (Next 24 Hours)</h3>
      <ul>
        {upcomingStreams.length > 0 ? (
          upcomingStreams.map((stream, index) => (
            <li key={index}>
              <strong>{stream.title}</strong> - {stream.startTime}
              <br />
              <img
                src={stream.imageUrl}
                alt={stream.title}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  margin: "5px 0",
                }}
              />
              <br />
              <a
                href={stream.livestreamUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch Stream
              </a>
            </li>
          ))
        ) : (
          <p>No upcoming livestreams.</p>
        )}
      </ul>
    </div>
  );
};

export default ScheduleLive;
