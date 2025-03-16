"use client";

import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const NotesContext = createContext(null);

export function NotesProvider({ children }) {
  const { accessToken } = useAuth();
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");

  const fetchNotes = async () => {
    if (!accessToken) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notes`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );
      setNotes(res.data);
    } catch (err) {
      setError("Failed to fetch notes");
    }
  };

  // When accessToken changes, refetch notes.
  useEffect(() => {
    fetchNotes();
  }, [accessToken]);

  return (
    <NotesContext.Provider value={{ notes, setNotes, fetchNotes, error }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}
