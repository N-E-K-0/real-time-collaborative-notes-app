"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const router = useRouter();
  const { accessToken, setAccessToken } = useAuth();
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNotes() {
      // Use the token from the context instead of localStorage
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
    }
    if (accessToken) fetchNotes();
  }, [accessToken]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      // Clear the in-memory token
      setAccessToken(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">My Notes</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {notes.map((note: any) => (
            <li
              key={note._id}
              className="border rounded-lg p-4 hover:shadow-lg transition"
            >
              <Link href={`/note/${note._id}`}>
                <span className="text-xl font-semibold text-blue-600 hover:underline cursor-pointer">
                  {note.title}
                </span>
              </Link>
              <p className="text-gray-600 mt-2 line-clamp-3">{note.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
