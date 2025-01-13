import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ScheduleLive = ({ contract }) => {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [duration, setDuration] = useState(1); // Default: 30 minutes
  const [bookedSlots, setBookedSlots] = useState([]);
  const [next24HoursEvents, setNext24HoursEvents] = useState([]);

  const fetchBookedSlots = useCallback(async () => {
    try {
      const eventIds = await contract.getMyBookedShows();
      const events = await Promise.all(
        eventIds.map(async (eventId) => {
          const event = await contract.getEventDetails(eventId);
          return event.isActive
            ? {
                id: event.id,
                title: event.title,
                imageUrl: event.imageUrl,
                livestreamUrl: event.livestreamUrl,
                startTime: new Date(Number(event.startTime) * 1000).toLocaleString(),
                endTime: new Date(Number(event.endTime) * 1000).toLocaleString(),
              }
            : null;
        })
      );
      setBookedSlots(events.filter((event) => event !== null));
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  }, [contract]);

  const fetchNext24HoursEvents = useCallback(async () => {
    try {
      const eventIds = await contract.getLiveShowsInNext24Hours();
      const events = await Promise.all(
        eventIds.map(async (eventId) => {
          const event = await contract.getEventDetails(eventId);
          return event.isActive
            ? {
                id: event.id,
                title: event.title,
                imageUrl: event.imageUrl,
                livestreamUrl: event.livestreamUrl,
                startTime: new Date(Number(event.startTime) * 1000).toLocaleString(),
                endTime: new Date(Number(event.endTime) * 1000).toLocaleString(),
              }
            : null;
        })
      );
      setNext24HoursEvents(events.filter((event) => event !== null));
    } catch (error) {
      console.error("Error fetching live shows in the next 24 hours:", error);
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
        duration
      );
      await tx.wait();
      alert("Livestream scheduled successfully!");
      fetchBookedSlots();
      fetchNext24HoursEvents();
    } catch (error) {
      console.error("Error scheduling livestream:", error);
      if (error.reason === "Too many bookings for today!") {
        alert("You have reached the maximum number of bookings allowed for today.");
      } else if (error.reason === "Cannot book more than 10 slots (5 hours) in a single booking") {
        alert("You cannot book more than 10 slots (5 hours) in a single booking.");
      } else if (error.reason === "Slot is already booked") {
        alert("One or more selected slots are already booked.");
      } else {
        alert("Failed to schedule livestream. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (contract) {
      fetchBookedSlots();
      fetchNext24HoursEvents();
    }
  }, [contract, fetchBookedSlots, fetchNext24HoursEvents]);

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
            showTimeSelectOnly
            timeIntervals={30}
            timeCaption="Time"
          />
        </div>
        <div>
          <label>Extend:</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            {[...Array(10)].map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1} ({(i + 1) * 30} minutes)
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Schedule Livestream</button>
      </form>

      <h3>My Scheduled Live Events</h3>
      <ul>
        {bookedSlots.length > 0 ? (
          bookedSlots.map((slot) => (
            <li key={slot.id}>
              <strong>{slot.title}</strong>: {slot.startTime} - {slot.endTime}
            </li>
          ))
        ) : (
          <p>No scheduled events.</p>
        )}
      </ul>

      <h3>Live Events in the Next 24 Hours</h3>
      <ul>
        {next24HoursEvents.length > 0 ? (
          next24HoursEvents.map((event) => (
            <li key={event.id}>
              <strong>{event.title}</strong>: {event.startTime} - {event.endTime}
            </li>
          ))
        ) : (
          <p>No live events in the next 24 hours.</p>
        )}
      </ul>
    </div>
  );
};

export default ScheduleLive;
