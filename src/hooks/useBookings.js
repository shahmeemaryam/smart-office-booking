import { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import {
  ref,
  push,
  update,
  remove,
  onValue,
  serverTimestamp,
} from "firebase/database";

/* ---------- HELPERS ---------- */
function buildStartDateTime(date, timeSlot) {
  if (!date || !timeSlot) return null;
  const start = timeSlot.split(" - ")[0];
  return new Date(`${date}T${start}`);
}

function buildEndDateTime(date, timeSlot) {
  if (!date || !timeSlot) return null;
  const end = timeSlot.split(" - ")[1];
  return new Date(`${date}T${end}`);
}

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  /* ---------- READ ---------- */
  useEffect(() => {
    if (!currentUser) return;

    const bookingsRef = ref(db, "bookings");

    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const bookingArray = Object.entries(data)
          .map(([id, value]) => {
            const startDateTime = buildStartDateTime(value.date, value.timeSlot);
            const endDateTime = buildEndDateTime(value.date, value.timeSlot);

            return {
              id,
              ...value,
              startDateTime,
              endDateTime,
            };
          })
          .filter((b) => b.userId === currentUser.uid);

        setBookings(bookingArray);
      } else {
        setBookings([]);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  /* ---------- CREATE ---------- */
  async function addBooking(bookingData) {
    try {
      const bookingsRef = ref(db, "bookings");

      await push(bookingsRef, {
        ...bookingData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding booking:", error);
      throw error;
    }
  }

  /* ---------- UPDATE ---------- */
  async function updateBooking(id, updatedData) {
    try {
      const bookingRef = ref(db, `bookings/${id}`);

      await update(bookingRef, updatedData);
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
  }

  /* ---------- DELETE ---------- */
  async function deleteBooking(id) {
    try {
      const bookingRef = ref(db, `bookings/${id}`);

      await remove(bookingRef);
    } catch (error) {
      console.error("Error deleting booking:", error);
      throw error;
    }
  }

  /* ---------- SORTED BOOKINGS (OPTIONAL BUT USEFUL) ---------- */
  const sortedBookings = useMemo(() => {
    return [...bookings].sort(
      (a, b) =>
        new Date(a.startDateTime) - new Date(b.startDateTime)
    );
  }, [bookings]);

  return {
    bookings: sortedBookings,
    loading,
    addBooking,
    updateBooking,
    deleteBooking,
  };
}