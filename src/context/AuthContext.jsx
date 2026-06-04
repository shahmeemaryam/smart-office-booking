import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { ref, set, get } from "firebase/database";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ SIGNUP FIXED
  async function signup(name, email, password) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    await set(ref(db, `users/${uid}`), {
      name,
      email,
    });

    return userCredential;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    setCurrentUser(null);
    setUserName("");
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setUserName("");
        setLoading(false);
        return;
      }

      try {
        const snapshot = await get(ref(db, `users/${user.uid}`));

        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserName(data.name || "");
        } else {
          setUserName("");
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        setUserName("");
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userName,
        signup,
        login,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}