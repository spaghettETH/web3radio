import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useWeb3Radio } from "../context/Web3RadioContext";
import { motion, AnimatePresence } from "framer-motion";
import { usePopup } from "../context/PopupContext";
import BookedSlot from "./BookedSlot";
import { FaVideo, FaImage, FaClock } from 'react-icons/fa';
import FormatBannerInfo from "./FormatBannerInfo";
import { useAccount } from "@megotickets/wallet";

interface ScheduleLiveProps {
}

const ScheduleLive: React.FC<ScheduleLiveProps> = () => {
  const [title, setTitle] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number>(1); // Default: 30 minutes
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { fetchBookedSlots, fetchNext24HoursEvents, bookedSlots, next24HoursEvents, scheduleLive } = useWeb3Radio();
  const { address } = useAccount();
  const { openPopup } = usePopup();

  const onScheduleLive = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !imageUrl || !streamUrl || !selectedDate) {
      openPopup({ title: "Required information", message: "Please fill in all fields.", type: "error" });
      return;
    }

    const startTime = Math.floor(selectedDate.getTime() / 1000);

    try {
      openPopup({ title: "Scheduling...", message: "Livestream scheduling...", type: "loading" });
      await scheduleLive(title, imageUrl, streamUrl, startTime, duration);
      openPopup({ title: "Scheduled", message: "Livestream scheduled successfully!", type: "success" });
      setTitle("");
      setImageUrl("");
      setStreamUrl("");
      setSelectedDate(null);
      setDuration(1);
    } catch (error: any) {
      console.error("Error scheduling livestream:", error);
      if (error.reason === "Too many bookings for today!") {
        openPopup({ title: "Error", message: "You have reached the maximum number of bookings allowed for today.", type: "error" });
      } else if (error.reason === "Cannot book more than 10 slots (5 hours) in a single booking") {
        openPopup({ title: "Error", message: "You cannot book more than 10 slots (5 hours) in a single booking.", type: "error" });
      } else if (error.reason === "Slot is already booked") {
        openPopup({ title: "Error", message: "One or more selected slots are already booked.", type: "error" });
      } else {
        openPopup({ title: "Error", message: "Failed to schedule livestream. Please try again.", type: "error" });
      }
    }
  };

  useEffect(() => {
    if (address) {
      fetchBookedSlots();
      fetchNext24HoursEvents();
    }
  }, [fetchBookedSlots, fetchNext24HoursEvents, address]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const formVariants = {
    hidden: {
      height: 0,
      opacity: 0
    },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.4 },
        opacity: { duration: 0.3, delay: 0.2 }
      }
    }
  };


  return (
    <motion.div
      className="w-full bg-black text-white p-10 rounded-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col lg:flex-row justify-between">
        <motion.div
          className="relative w-full lg:w-2/3"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h4 className="text-xl font-bold uppercase">Schedule</h4>
          <p className="text-5xl uppercase">
            Plan your <br />live stream!
          </p>
        </motion.div>
      </div>

      {errorMessage && (
        <motion.p
          style={{ color: "red" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {errorMessage}
        </motion.p>
      )}

      <motion.form
        onSubmit={onScheduleLive}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        className="mt-10"
      >
        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-full flex flex-col lg:flex-row gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full"
            >
              <label htmlFor="imageUrl" className="flex items-center gap-2">
                <FaImage className="mr-2" />
                <p>COVER IMAGE</p>
                <FormatBannerInfo
                  bannerData={{
                    title: "Accepted Cover Image Links:",
                    description: "IPFS, Swarm, Pinata URIs, Google Drive, Dropbox",
                    icon: <FaImage />
                  }}
                  circleWidth={20}
                />
              </label>
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                placeholder="https://Link to cover image"
                aria-label="Cover Image URL"
                className="w-full border border-white rounded-md bg-black text-white p-2"
              />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full"
            >
              <label htmlFor="streamUrl" className="flex items-center gap-2">
                <FaVideo className="mr-2" />
                <p>STREAM URL</p>
                <FormatBannerInfo
                  bannerData={{
                    title: "Accepted Stream URL Links:",
                    description: "HLS (.m3u e .m3u8), Youtube, Twitch, Livepeer, traditional server",
                    icon: <FaVideo />
                  }}
                  circleWidth={20}
                />
              </label>
              <input
                id="streamUrl"
                type="url"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                required
                placeholder="https://Link to stream"
                aria-label="Stream URL"
                className="w-full border border-white rounded-md bg-black text-white p-2"
              />
            </motion.div>
          </div>

          <div className="w-full flex flex-col lg:flex-row gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full lg:w-2/3"
            >
              <label htmlFor="title" className="flex items-center">
                <p>TITLE</p>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                aria-label="Stream Title"
                className="w-full border border-white rounded-md bg-black text-white p-2"
              />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full lg:w-1/3 flex items-end"
            >
              <button
                type="submit"
                className="submit-button uppercase h-[42px] w-full"
              >
                Schedule Live
                &nbsp;→
              </button>
            </motion.div>
          </div>

          <div className="w-full flex flex-col lg:flex-row gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full lg:w-2/3"
            >
              <label htmlFor="selectedDate" className="flex items-center">
                <FaClock className="mr-2" />
                <p>START TIME</p>
              </label>
              {/* @ts-ignore */}
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                showTimeSelect
                dateFormat="Pp"
                timeIntervals={30}
                timeCaption="Time"
                className="w-full border border-white rounded-md bg-black text-white p-2"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full lg:w-1/3"
            >
              <label htmlFor="duration" className="flex items-center">
                <p>EXTEND</p>
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full border border-white rounded-md bg-black text-white p-2"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1} ({(i + 1) * 30} minutes)
                  </option>
                ))}
              </select>
            </motion.div>
          </div>
        </motion.div>
      </motion.form>

      <h3 className="text-white text-2xl font-bold mt-10">My Scheduled Live Events</h3>
      <ul>
        {
          bookedSlots.length > 0 ?
            bookedSlots.map((slot) => <BookedSlot key={slot.id} slot={slot} isCompact={true} />)
            :
            <p className="text-white">No scheduled events.</p>
        }
      </ul>

      <h3 className="text-white text-2xl font-bold mt-10">Live Events in the Next 24 Hours</h3>
      <ul>
        {next24HoursEvents.length > 0 ? (
          next24HoursEvents.map((event) => (
            <BookedSlot key={event.id} slot={event} isCompact={false} canDelete={false} />
          ))
        ) : (
          <p className="text-white">No live events in the next 24 hours.</p>
        )}
      </ul>
    </motion.div>
  );
};

export default ScheduleLive;
