console.log("NewBooking component loaded");

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useBookings } from "../hooks/useBookings";
import officeData from "../data/offices.json";

const timeSlots = [
  "09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00",
];

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isValidRange(start, end) {
  return timeToMinutes(end) > timeToMinutes(start);
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function isPastTime(date, time) {
  const now = new Date();
  const selected = new Date(date);
  const [h, m] = time.split(":").map(Number);
  selected.setHours(h, m, 0, 0);
  return selected < now;
}

export default function NewBooking() {
  const navigate = useNavigate();
  const { addBooking, bookings } = useBookings();

  const [floor, setFloor] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [date, setDate] = useState("");

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const selectedFloor = officeData.floors.find(f => f.id === floor);
  const selectedResource = selectedFloor?.resources.find(r => r.id === resourceId);

  const startRef = useRef(null);
  const endRef = useRef(null);

  function buildTimeSlot() {
    return `${startTime} - ${endTime}`;
  }

  function isRoomBooked(resourceId, date, newStart, newEnd) {
    const ns = timeToMinutes(newStart);
    const ne = timeToMinutes(newEnd);

    return bookings?.some((b) => {
      if (b.resourceId !== resourceId) return false;
      if (b.date !== date) return false;

      const [bs, be] = b.timeSlot.split(" - ");

      return rangesOverlap(
        ns, ne,
        timeToMinutes(bs),
        timeToMinutes(be)
      );
    });
  }

  function handleSelectStart(t) {
    if (date && isPastTime(date, t)) return;

    setStartTime(t);

    if (!isValidRange(t, endTime)) {
      const next = timeSlots.find(x => timeToMinutes(x) > timeToMinutes(t));
      setEndTime(next || t);
    }
  }

  function handleSelectEnd(t) {
    if (!isValidRange(startTime, t)) return;
    setEndTime(t);
  }

  async function handleSubmit() {
    if (!floor || !resourceId || !date) {
      setError("Please fill all fields");
      return;
    }

    if (!isValidRange(startTime, endTime)) {
      setError("Invalid time range");
      return;
    }

    if (isPastTime(date, startTime)) {
      setError("Cannot book past time slots");
      return;
    }

    if (isRoomBooked(resourceId, date, startTime, endTime)) {
      setError("Already booked for this time");
      return;
    }

    setError("");
    setLoading(true);

    try {
  await addBooking({
  floorId: floor,
  floorName: selectedFloor?.name,
  resourceId,
  resourceName: selectedResource?.name,
  resourceType: selectedResource?.type,
  resourceImage: selectedResource?.image || "", // ✅ SAFE FALLBACK
  date,
  timeSlot: buildTimeSlot(),
});

      setLoading(false);
      setShowPopup(true);
    } catch (err) {
      setError("Failed to create booking");
      setLoading(false);
    }
  }

  return (
    <>
      {/* POPUP (UNCHANGED STYLE) */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-gray-200 dark:border-zinc-700 p-6">

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
              Booking Confirmed
            </h2>

            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
              Your reservation has been created successfully.
            </p>

            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Room</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {selectedResource?.name}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Floor</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {selectedFloor?.name}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {date}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {buildTimeSlot()}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/my-bookings")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
            >
              View My Bookings
            </button>
          </div>
        </div>
      )}

      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-8">

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            New Booking
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-3xl shadow-xl p-6 space-y-6">

            {/* FLOORS */}
            <div>
              <label className="font-semibold text-gray-700 dark:text-white">
                Select Floor
              </label>
<br></br>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {officeData.floors.map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFloor(f.id);
                      setResourceId("");
                    }}
                    className={`px-4 py-2 rounded-xl border transition ${
                      floor === f.id
                        ? "bg-blue-600 text-white border-blue-600 "
                        : "bg-white dark:bg-zinc-800 text-gray-800 hover:bg-blue-400 dark:text-white border-gray-200 dark:border-zinc-700"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ROOMS (kept same behavior + dark mode consistent) */}
            {selectedFloor && (
              <div>
                <label className="font-semibold text-gray-700 dark:text-white">
                  Select Room
                </label>

                <div className="mt-3 flex gap-4 overflow-x-auto pb-3 scroll-smooth">
                  {selectedFloor.resources.map(r => {
                    const blocked = isRoomBooked(r.id, date, startTime, endTime);
                    const active = resourceId === r.id;

                    return (
                      <div
                        key={r.id}
                        onClick={() => !blocked && setResourceId(r.id)}
                        className={`min-w-65 rounded-2xl overflow-hidden cursor-pointer border transition ${
                          blocked
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:shadow-lg"
                        } ${
                          active
                            ? "border-blue-600 ring-2 ring-blue-200 dark:ring-blue-400"
                            : "border-gray-200 dark:border-zinc-700"
                        }`}
                      >
                        <img
                          src={r.image || "/rooms/default.jpg"}
                          className="h-40 w-full object-cover"
                        />

                        <div className="p-3 bg-white dark:bg-zinc-900">
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {r.name}
                          </h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

           {/* DATE PICKER (FULL CLICKABLE AREA) */}
<div
  className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-4 shadow-sm transition cursor-pointer"
  onClick={() => {
    const input = document.getElementById("booking-date");
    if (input?.showPicker) {
      input.showPicker(); // modern browsers
    } else {
      input?.focus(); // fallback
    }
  }}
>

  <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
    Select Date
  </label>

  <div className="flex items-center gap-4">

    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
      <span className="text-blue-600 dark:text-blue-400 text-xl">📅</span>
    </div>

    <div className="flex-1">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {date ? date : "Click to choose a date"}
      </p>

      <input
        id="booking-date"
        type="date"
        value={date}
        min={new Date().toISOString().split("T")[0]}
        onChange={(e) => setDate(e.target.value)}
        className="opacity-0 absolute pointer-events-none"
      />
    </div>

  </div>

  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
    You can only book from today onwards
  </p>
</div>

     {/* TIME PICKERS */}
<div className="space-y-4">

  {/* START TIME */}
  <div>
    <label className="font-semibold text-gray-700 dark:text-white">
      Select Start Time
    </label>

   <div
  ref={startRef}
  className="mt-2 flex gap-2 overflow-x-auto border rounded-xl border-gray-200 dark:border-zinc-700 p-2"
>
      {timeSlots.map(t => {
        const disabled = date && isPastTime(date, t);

        return (
          <div
            key={t}
            onClick={() => !disabled && handleSelectStart(t)}
            className={`min-w-22.5 h-10 shrink-0 flex items-center justify-center rounded-lg cursor-pointer ${
              disabled
                ? "bg-gray-200 text-gray-400"
                : startTime === t
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-white"
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
  ref={endRef}
  className={`mt-2 flex gap-2 overflow-x-auto border rounded-xl border-gray-200 dark:border-zinc-700 p-2 ${
    !startTime ? "opacity-40 pointer-events-none" : ""
  }`}
>
      {timeSlots.map(t => {
        const disabled =
          timeToMinutes(t) <= timeToMinutes(startTime) ||
          (date && isPastTime(date, t));

        return (
          <div
            key={t}
            onClick={() => !disabled && handleSelectEnd(t)}
            className={`min-w-22.5 h-10 shrink-0 flex items-center justify-center rounded-lg cursor-pointer ${
              disabled
                ? "bg-gray-200 text-gray-400"
                : endTime === t
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-white"
            }`}
          >
            {t}
          </div>
        );
      })}
    </div>
  </div>

  {/* SUBMIT */}
  <button
    onClick={handleSubmit}
    disabled={loading}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
  >
    {loading ? "Creating..." : "Confirm Booking"}
  </button>
</div>
</div>
        </div>
      </Layout>
    </>
  );
}