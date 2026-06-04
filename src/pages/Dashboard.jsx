import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import officeData from "../data/offices.json";
import { HiCalendar, HiOfficeBuilding, HiClock } from "react-icons/hi";
import { useBookings } from "../hooks/useBookings";
import { useMemo, useState, useEffect } from "react";
import Holidays from "../components/Holidays";

/* ---------- TIME HELPERS ---------- */
function getStartDateTime(booking) {
  const date = new Date(booking.date);
  const [start] = booking.timeSlot.split(" - ");
  const [h, m] = start.split(":").map(Number);
  date.setHours(h, m, 0, 0);
  return date;
}

function getTimeLeft(target) {
  const diff = target - new Date();
  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function Dashboard() {
  const { currentUser, userName } = useAuth();
  const { bookings } = useBookings();
  const navigate = useNavigate();

  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const roomImageMap = useMemo(() => {
    const map = {};
    officeData.floors.forEach((floor) => {
      floor.resources.forEach((res) => {
        map[res.id] = res.image;
      });
    });
    return map;
  }, []);

  const nextBooking = useMemo(() => {
    if (!bookings?.length) return null;

    const now = new Date();

    return bookings
      .map((b) => ({ ...b, start: getStartDateTime(b) }))
      .filter((b) => b.start > now)
      .sort((a, b) => a.start - b.start)[0];
  }, [bookings]);

  const timeLeft = nextBooking ? getTimeLeft(nextBooking.start) : null;

  const roomImage = nextBooking
    ? roomImageMap[nextBooking.resourceId]
    : null;

  const totalResources = officeData.floors.reduce(
    (acc, f) => acc + f.resources.length,
    0
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* WELCOME */}
        <div className="bg-blue-500 dark:bg-blue-700 text-white rounded-2xl p-6 mb-6 shadow">
          <h1 className="text-2xl font-bold">
            Welcome back 👋 {userName || currentUser?.email?.split("@")[0]}
          </h1>
        </div>

        {/* NEXT MEETING */}
        {nextBooking && (
          <div
            onClick={() => navigate("/my-bookings")}
            className="relative mb-6 rounded-2xl overflow-hidden p-5 text-white cursor-pointer shadow"
          >
            {roomImage && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${roomImage})` }}
              />
            )}

           <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

            <div className="relative z-10">
              <h2 className="text-lg font-bold dark:text-white">
                Next Meeting: {nextBooking.resourceName}
              </h2>

              <p className="text-sm opacity-90 dark:text-white">
                {nextBooking.date} • {nextBooking.timeSlot}
              </p>

              <p className="mt-2 text-yellow-300 font-semibold">
                Starts in: {timeLeft}
              </p>
            </div>
          </div>
        )}

        {/* STATS CARDS (FIXED + ICONS RESTORED) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          {/* TOTAL RESOURCES */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-5 flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 p-3 rounded-lg">
              <HiOfficeBuilding size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Resources
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {totalResources}
              </p>
            </div>
          </div>

          {/* FLOORS */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-5 flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 p-3 rounded-lg">
              <HiCalendar size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Floors Available
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {officeData.floors.length}
              </p>
            </div>
          </div>

          {/* TIME SLOTS */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-5 flex items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 p-3 rounded-lg">
              <HiClock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Time Slots
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {officeData.timeSlots.length}
              </p>
            </div>
          </div>

        </div>

        {/* QUICK ACTIONS (UNCHANGED) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          <button
            onClick={() => navigate("/new-booking")}
            className="bg-white dark:bg-zinc-900 hover:bg-blue-300 dark:hover:bg-zinc-800 text-gray-800 dark:text-white rounded-xl p-6 text-left shadow border border-gray-200 dark:border-zinc-700 transition-colors"
          >
            <HiCalendar size={28} className="mb-2" />
            <h3 className="text-lg font-bold">New Booking</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Reserve a desk or meeting room
            </p>
          </button>

          <button
            onClick={() => navigate("/my-bookings")}
            className="bg-white dark:bg-zinc-900 hover:bg-blue-300 dark:hover:bg-zinc-800 text-gray-800 dark:text-white rounded-xl p-6 text-left shadow border border-gray-200 dark:border-zinc-700 transition-colors"
          >
            <HiOfficeBuilding size={28} className="mb-2 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold">My Bookings</h3>
            <p className="text-gray-500 dark:text-gray-400">
              View, edit or cancel your bookings
            </p>
          </button>

        </div>

        {/* OFFICE OVERVIEW */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6">

          <h2 className="text-lg font-bold dark:text-white mb-4">
            Office Overview — {officeData.company}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {officeData.floors.map((floor) => (
              <div
                key={floor.id}
                className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4"
              >
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  {floor.name}
                </h3>

                <ul className="space-y-1 text-sm">
                  {floor.resources.map((r) => (
                    <li
                      key={r.id}
                      className="flex justify-between dark:text-gray-300"
                    >
                      <span>{r.name}</span>
                      <span className="text-gray-400 dark:text-gray-500">
                        {r.type === "room"
                          ? `up to ${r.capacity}`
                          : "desk"}
                      </span>
                    </li>
                  ))}
                </ul>

              </div>
            ))}

          </div>
        </div>

        <div className="mt-8">
          <Holidays />
        </div>

      </div>
    </Layout>
  );
}