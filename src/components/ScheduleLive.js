import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ScheduleLive = ({ contract }) => {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [duration, setDuration] = useState(60); // Default duration: 60 mins
  const [bookedSlots, setBookedSlots] = useState([]);
  const [upcomingStreams, setUpcomingStreams] = useState([]);

  const fetchBookedSlots = useCallback(async () => {
    try {
      const [
        ids,
        titles,
        imageUrls,
        livestreamUrls,
        startTimes,
        durations,
        creators,
      ] = await contract.getMyBookedShows();

      const slots = startTimes.map((time, index) => ({
        id: ids[index].toString(),
        title: titles[index],
        imageUrl: imageUrls[index],
        livestreamUrl: livestreamUrls[index],
        start: new Date(Number(time) * 1000).toLocaleString(),
        end: new Date(
          (Number(time) + Number(durations[index])) * 1000
        ).toLocaleString(),
        creator: creators[index],
      }));

      setBookedSlots(slots);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  }, [contract]);

  const fetchUpcomingStreams = useCallback(async () => {
    try {
      const [
        ids,
        titles,
        imageUrls,
        livestreamUrls,
        startTimes,
        durations,
        creators,
      ] = await contract.getAllEventsSimplified();

      console.log("Raw upcoming events data:", { ids, startTimes });

      const currentTime = Math.floor(Date.now() / 1000);
      const next24Hours = currentTime + 24 * 60 * 60;

      const streams = startTimes
        .map((time, index) => ({
          id: ids[index].toString(),
          title: titles[index],
          imageUrl: imageUrls[index],
          livestreamUrl: livestreamUrls[index],
          startTime: new Date(Number(time) * 1000).toLocaleString(),
          endTime: new Date(
            (Number(time) + Number(durations[index])) * 1000
          ).toLocaleString(),
          duration: Number(durations[index]),
          creator: creators[index],
        }))
        .filter(
          (stream) =>
            Number(startTimes[stream.id]) >= currentTime &&
            Number(startTimes[stream.id]) <= next24Hours
        );

      setUpcomingStreams(streams);
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

    const startTime = Math.floor(selectedDate.getTime() / 1000); // Convert to Unix timestamp

    try {
      const tx = await contract.scheduleEvent(
        title,
        imageUrl,
        streamUrl,
        startTime,
        duration * 60
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
          <label>Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            showTimeSelect
            dateFormat="Pp"
          />
        </div>
        <div>
          <label>Duration:</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            <option value={60}>1 Hour</option>
            <option value={30}>30 Minutes</option>
            <option value={15}>15 Minutes</option>
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
