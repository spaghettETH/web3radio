import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useWeb3Radio } from "../context/Web3RadioContext";
import { motion } from "framer-motion";
import { usePopup } from "../context/PopupContext";
import BookedSlot from "./BookedSlot";
import { isLiveUriFromAllowedPlatforms, isSubmitUriFromAllowedPlatforms } from "../utils/Utils";
import StreamingPlatformBanner from "./popups/StreamingPlatformBanner";
import SubmittingPlatformBanner from "./popups/SubmittingPlatformBanner";

interface ScheduleLiveProps {
}

const ScheduleLive: React.FC<ScheduleLiveProps> = () => {
  const [title, setTitle] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number>(1); // Default: 30 minutes
  const { scheduleLiveContract: contract, fetchBookedSlots, fetchNext24HoursEvents, bookedSlots, next24HoursEvents, scheduleLive } = useWeb3Radio();
  const { openPopup } = usePopup();

  const onScheduleLive = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !imageUrl || !streamUrl || !selectedDate || !contract) {
      openPopup({title: "Required information",message: "Please fill in all fields.",type: "error"});
      return;
    }

    const startTime = Math.floor(selectedDate.getTime() / 1000);

    try {
      openPopup({title: "Scheduling...",message: "Livestream scheduling...",type: "loading"});
      await scheduleLive(title, imageUrl, streamUrl, startTime, duration);
      openPopup({title: "Scheduled",message: "Livestream scheduled successfully!",type: "success"});
    } catch (error: any) {
      console.error("Error scheduling livestream:", error);
      if (error.reason === "Too many bookings for today!") {
        openPopup({title: "Error",message: "You have reached the maximum number of bookings allowed for today.",type: "error"});
      } else if (error.reason === "Cannot book more than 10 slots (5 hours) in a single booking") {
        openPopup({title: "Error",message: "You cannot book more than 10 slots (5 hours) in a single booking.",type: "error"});
      } else if (error.reason === "Slot is already booked") {
        openPopup({title: "Error",message: "One or more selected slots are already booked.",type: "error"});
      } else {
        openPopup({title: "Error",message: "Failed to schedule livestream. Please try again.",type: "error"});
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
      <form onSubmit={onScheduleLive}>
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
        <motion.button
          type="submit"
          className={`bg-black text-white px-4 py-2 rounded-md uppercase font-bold mt-4 mb-4`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {'Schedule Livestream'.toUpperCase()}
        </motion.button>
      </form>

      <h3>My Scheduled Live Events</h3>
      <ul>
        {
          bookedSlots.length > 0 ?
            bookedSlots.map((slot) => <BookedSlot key={slot.id} slot={slot} />)
            :
            <p>No scheduled events.</p>
        }
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
