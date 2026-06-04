import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { ref, set } from "firebase/database";
import { db } from "../firebase";

import {
  HiHome,
  HiCalendar,
  HiUser,
  HiLogout,
  HiSun,
  HiMoon,
  HiOutlineUserCircle,
} from "react-icons/hi";

export default function Navbar() {
  const { currentUser, logout, userName } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfile, setShowProfile] = useState(false);
  const [editName, setEditName] = useState("");

  const displayName =
    userName || currentUser?.email?.split("@")[0];

  const initials =
    displayName?.charAt(0)?.toUpperCase() || "U";

  /* INIT EDIT NAME */
  useEffect(() => {
    if (showProfile) {
      setEditName(displayName || "");
    }
  }, [showProfile]);

  /* ESC CLOSE */
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setShowProfile(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  /* OUTSIDE CLICK CLOSE */
  function handleOverlayClick(e) {
    if (e.target.id === "profile-overlay") {
      setShowProfile(false);
    }
  }

  async function handleLogout() {
    const confirmLogout = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmLogout) return;

    await logout();
    navigate("/login");
  }

  /* UPDATE NAME IN FIREBASE */
  async function handleNameUpdate() {
    if (!currentUser) return;

    await set(ref(db, `users/${currentUser.uid}`), {
      name: editName,
      email: currentUser.email,
    });

    setShowProfile(false);
  }

  const navLinks = [
    { path: "/dashboard", label: "Home", icon: <HiHome size={20} /> },
    { path: "/new-booking", label: "Book", icon: <HiCalendar size={20} /> },
    { path: "/my-bookings", label: "My Bookings", icon: <HiUser size={20} /> },
  ];

  return (
    <>
      {/* TOP NAV */}
      <nav className="hidden md:flex items-center justify-between bg-blue-500 dark:bg-zinc-900 text-white px-8 py-4 shadow-md">

        <span className="text-xl font-bold">SmartOffice</span>

        <div className="flex items-center gap-6">

          {navLinks.map((link) => {
            const active = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 text-sm font-medium ${
                  active
                    ? "underline underline-offset-4"
                    : "hover:text-blue-200 dark:hover:text-blue-400"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}

          <button onClick={toggleDarkMode}>
            {darkMode ? <HiSun size={20} /> : <HiMoon size={20} />}
          </button>

          {/* PROFILE ICON */}
          <button onClick={() => setShowProfile(true)}>
            <HiOutlineUserCircle size={26} />
          </button>

        </div>
      </nav>

      
    {/* MOBILE NAV (FIXED ALIGNMENT) */}
<nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700">

  {navLinks.map((link) => {
    const active = location.pathname === link.path;

    return (
      <Link
        key={link.path}
        to={link.path}
        className={`flex flex-col items-center justify-center flex-1 py-3 text-xs gap-1 transition
          ${
            active
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-white"
          }
        `}
      >
        <span className="flex items-center justify-center">
          {link.icon}
        </span>

        <span className="leading-none">{link.label}</span>
      </Link>
    );
  })}

  {/* DARK MODE */}
  <button
    onClick={toggleDarkMode}
    className="flex flex-col items-center justify-center flex-1 py-3 text-xs gap-1 text-gray-500 dark:text-white"
  >
    <span className="flex items-center justify-center">
      {darkMode ? <HiSun size={20} /> : <HiMoon size={20} />}
    </span>

    <span className="leading-none">Theme</span>
  </button>

  {/* PROFILE */}
  <button
    onClick={() => setShowProfile(true)}
    className="flex flex-col items-center justify-center flex-1 py-3 text-xs gap-1 text-gray-500 dark:text-white"
  >
    <span className="flex items-center justify-center">
      <HiOutlineUserCircle size={20} />
    </span>

    <span className="leading-none">Profile</span>
  </button>

</nav>

      {/* PROFILE MODAL (UNIFIED) */}
      {showProfile && (
        <div
          id="profile-overlay"
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg shadow-2xl p-6 animate-scaleIn">

            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
            </div>

            {/* NAME EDIT */}
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full mb-3 px-3 py-2 rounded-lg border dark:bg-zinc-800 dark:text-white dark:border-zinc-700 text-center"
            />

            {/* EMAIL */}
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
              {currentUser?.email}
            </p>

            {/* ACTIONS */}
            <div className="flex flex-col gap-3">

              <button
                onClick={handleNameUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
              >
                Save Changes
              </button>

              <button
                onClick={() => {
                  setShowProfile(false);
                  handleLogout();
                }}
                className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium"
              >
                Logout
              </button>

              <button
                onClick={() => setShowProfile(false)}
                className="bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-white py-2 rounded-lg"
              >
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ANIMATION */}
      <style>
        {`
          @keyframes scaleIn {
            from { transform: scale(0.85); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scaleIn {
            animation: scaleIn 0.2s ease-out;
          }
        `}
      </style>
    </>
  );
}