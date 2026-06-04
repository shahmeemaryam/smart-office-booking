import { useState } from "react";
import Layout from "../components/Layout";
import { useBookings } from "../hooks/useBookings";
import { HiTrash, HiPencil } from "react-icons/hi";

/* ---------- TIME HELPERS ---------- */
function getEndDate(booking) {
  const date = new Date(booking.date);
  const [, end] = booking.timeSlot.split(" - ");
  const [h, m] = end.split(":").map(Number);

  date.setHours(h, m, 0, 0);
  return date;
}

function formatCountdown(diffMs) {
  const totalSeconds = Math.floor(diffMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

const timeSlots = [
  "09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00",
];

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isPastTime(date, time) {
  const now = new Date();

  const selected = new Date(date);

  const [h, m] = time.split(":").map(Number);

  selected.setHours(h, m, 0, 0);

  return selected < now;
}

/* ---------- CARD ---------- */
function BookingCard({ booking, onDelete, onEdit }) {
  const endDate = getEndDate(booking);
  const now = new Date();
  const diff = endDate - now;

  const expired = diff <= 0;

  let timeLabel = "";
  let color = "";

  if (expired) {
    timeLabel = "Past Booking";
    color = "text-red-500";
  } else {
    const hoursLeft = diff / (1000 * 60 * 60);

    if (hoursLeft > 24) {
      const days = Math.ceil(hoursLeft / 24);
      timeLabel = `${days} day${days > 1 ? "s" : ""} left`;
      color = "text-blue-500";
    } else {
      timeLabel = formatCountdown(diff);
      color = "text-green-500";
    }
  }

  const bgImage = booking.resourceImage;

  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow border ${
        expired ? "opacity-60" : ""
      }`}
    >
      <div
        className="absolute inset-0 bg-gray-800"
        style={
          bgImage
            ? {
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

      <div className="relative p-5 text-white">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold text-white">
              {booking.resourceName}
            </h3>

            <p className="text-sm text-white/80">
              {booking.floorName}
            </p>

            <p className="text-xs mt-2">
              📅 {booking.date}
            </p>

            <p className="text-xs">
              🕒 {booking.timeSlot}
            </p>

            <p className={`text-xs mt-2 font-medium ${color}`}>
              ⏳ {timeLabel}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(booking)}
              className="text-blue-300 hover:text-blue-200"
            >
              <HiPencil />
            </button>

            <button
              onClick={() => onDelete(booking.id)}
              className="text-red-300 hover:text-red-200"
            >
              <HiTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- MAIN PAGE ---------- */
export default function MyBookings() {
  const {
    bookings,
    loading,
    deleteBooking,
    updateBooking,
  } = useBookings();

  const [showPast, setShowPast] = useState(false);

  const [editingBooking, setEditingBooking] = useState(null);

const [editedDate, setEditedDate] = useState("");

const [editedStartTime, setEditedStartTime] = useState("");
const [editedEndTime, setEditedEndTime] = useState("");

  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      await deleteBooking(id);
    }
  }
function handleEdit(booking) {
  setEditingBooking(booking);

  setEditedDate(booking.date);

  const [start, end] = booking.timeSlot.split(" - ");

  setEditedStartTime(start);
  setEditedEndTime(end);
}

  async function handleSaveEdit() {
    try {
      await updateBooking(editingBooking.id, {
  date: editedDate,
  timeSlot: `${editedStartTime} - ${editedEndTime}`,
});
      setEditingBooking(null);
    } catch (error) {
      console.error("Failed to update booking:", error);
      alert("Failed to update booking");
    }
  }

  const now = new Date();

  const activeBookings = bookings
    .filter((b) => getEndDate(b) > now)
    .sort((a, b) => getEndDate(a) - getEndDate(b));

  const pastBookings = bookings
    .filter((b) => getEndDate(b) <= now)
    .sort((a, b) => getEndDate(b) - getEndDate(a));

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Bookings
          </h1>

          <button
            onClick={() => setShowPast((p) => !p)}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg"
          >
            {showPast ? "View Active" : "View Past"}
          </button>
        </div>

       

        {/* CONTENT */}
        {loading && (
          <p className="text-center text-gray-500">
            Loading...
          </p>
        )}

       <div className="space-y-4">
  {!loading &&
    (showPast ? pastBookings : activeBookings).map((booking) => (
      <div key={booking.id}>
        <BookingCard
          booking={booking}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        {editingBooking?.id === booking.id && (
          <div className="mt-3 p-5 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-700 shadow">
            <h2 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Edit Booking
            </h2>
<div className="space-y-4">

  {/* DATE PICKER */}

  <div
    className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-4 shadow-sm cursor-pointer"
    onClick={() => {
      const input = document.getElementById(`edit-date-${booking.id}`);

      if (input?.showPicker) {
        input.showPicker();
      } else {
        input?.focus();
      }
    }}
  >
    <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
      Select Date
    </label>

    <div className="flex items-center gap-4">
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-zinc-800">
        📅
      </div>

      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {editedDate || "Click to choose a date"}
        </p>

        <input
          id={`edit-date-${booking.id}`}
          type="date"
          value={editedDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setEditedDate(e.target.value)}
          className="opacity-0 absolute pointer-events-none"
        />
      </div>
    </div>
  </div>

  {/* START TIME */}

  <div>
    <label className="font-semibold text-gray-700 dark:text-white">
      Select Start Time
    </label>

    <div className="mt-2 flex overflow-x-auto gap-2 border rounded-xl border-gray-200 dark:border-zinc-700 p-2">
      {timeSlots.map((t) => {
        const disabled =
          editedDate && isPastTime(editedDate, t);

        return (
          <div
            key={t}
            onClick={() =>
              !disabled && setEditedStartTime(t)
            }
            className={`min-w-22.5 h-10 shrink-0 flex items-center justify-center rounded-lg cursor-pointer ... ${
              disabled
                ? "bg-gray-200 text-gray-400"
                : editedStartTime === t
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-white"
            }`}
          >
            {t}
          </div>
        );
      })}
    </div>
  </div>

  {/* END TIME */}

  <div>
    <label className="font-semibold text-gray-700 dark:text-white">
      Select End Time
    </label>

    <div
      
  className={`mt-2 flex overflow-x-auto gap-2 border rounded-xl border-gray-200 dark:border-zinc-700 p-2 ${
        !editedStartTime
          ? "opacity-40 pointer-events-none"
          : ""
      }`}
    >
      {timeSlots.map((t) => {
        const disabled =
          timeToMinutes(t) <=
            timeToMinutes(editedStartTime) ||
          (editedDate &&
            isPastTime(editedDate, t));

        return (
          <div
            key={t}
            onClick={() =>
              !disabled && setEditedEndTime(t)
            }
            className={`min-w-22.5 h-10 shrink-0 flex items-center justify-center rounded-lg cursor-pointer ... ${
              disabled
                ? "bg-gray-200 text-gray-400"
                : editedEndTime === t
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 dark:hover:bg-zinc-800"
            }`}
          >
            {t}
          </div>
        );
      })}
    </div>
  </div>

  <div className="flex gap-2">
    <button
      onClick={handleSaveEdit}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
    >
      Save Changes
    </button>

    <button
      onClick={() => setEditingBooking(null)}
      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
    >
      Cancel
    </button>
  </div>

</div>
          </div>
        )}
      </div>
    ))}
</div>
      </div>
    </Layout>
  );
}