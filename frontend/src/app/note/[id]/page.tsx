"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import socket from "../../../lib/socket";
import { useAuth } from "../../../context/AuthContext";
import { useNotes } from "../../../context/NotesContext";

export default function NoteEditor() {
  const { id } = useParams();
  const router = useRouter();
  const { fetchNotes } = useNotes();
  const { accessToken, user } = useAuth();
  const [note, setNote] = useState({ title: "", content: "", history: [] });
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !accessToken) return;

    async function fetchNote() {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notes/${id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true,
          }
        );
        setNote(res.data);
        setError("");
      } catch (err: any) {
        console.error("Error fetching note", err);
        setError("Failed to fetch note");
      } finally {
        setLoading(false);
      }
    }

    fetchNote();

    // Join the note room for real-time updates
    // socket.emit("joinNote", { noteId: id, user: "TestUser" });
    socket.emit("joinNote", { noteId: id, user: user?.name || "Unknown" });

    // Listen for real-time note updates
    socket.on("noteUpdated", (data) => {
      if (data.noteId === id) {
        setNote((prev) => ({ ...prev, content: data.content }));
      }
    });

    // Listen for user presence events
    socket.on("userJoined", (data) => {
      if (data.noteId === id) {
        setActiveUsers((prev) => {
          if (!prev.includes(data.user)) return [...prev, data.user];
          return prev;
        });
      }
    });
    socket.on("userLeft", (data) => {
      if (data.noteId === id) {
        setActiveUsers((prev) => prev.filter((u) => u !== data.user));
      }
    });

    return () => {
      socket.emit("leaveNote", { noteId: id, user: "TestUser" });
      socket.off("noteUpdated");
      socket.off("userJoined");
      socket.off("userLeft");
    };
  }, [id, accessToken, user]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedTitle = e.target.value;
    setNote((prev) => ({ ...prev, title: updatedTitle }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedContent = e.target.value;
    setNote((prev) => ({ ...prev, content: updatedContent }));
    socket.emit("noteUpdate", {
      noteId: id,
      content: updatedContent,
      user: "TestUser",
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notes/${id}`,
        { title: note.title, content: note.content },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );
      setSaveMessage("Note saved successfully!");
      fetchNotes();
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("Error saving note", err);
      setError("Failed to save note");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notes/${id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );
      fetchNotes();
      router.push("/dashboard");
    } catch (err) {
      console.error("Error deleting note", err);
      setError("Failed to delete note");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-6">
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-6">
            <div className="mb-4">
              <input
                type="text"
                value={note.title}
                onChange={handleTitleChange}
                placeholder="Note Title"
                className="w-full border p-2 rounded-lg text-3xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              value={note.content}
              onChange={handleContentChange}
              className="w-full h-64 border p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start writing your note..."
            />
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Save
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
            {saveMessage && (
              <p className="text-green-500 text-center mt-4">{saveMessage}</p>
            )}
            <div className="mt-6">
              <h4 className="text-xl font-semibold mb-2">Active Users:</h4>
              {activeUsers.length > 0 ? (
                <ul className="list-disc pl-5">
                  {activeUsers.map((u, idx) => (
                    <li key={idx} className="text-gray-700">
                      {u}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">
                  No other users editing this note.
                </p>
              )}
            </div>
            <div className="mt-6">
              <h4 className="text-xl font-semibold mb-2">Revision History:</h4>
              {note.history && note.history.length > 0 ? (
                <ul className="space-y-2">
                  {note.history.map((entry: any, idx: number) => (
                    <li key={idx} className="text-gray-600">
                      <span className="font-semibold">
                        {new Date(entry.updatedAt).toLocaleString()}:
                      </span>{" "}
                      {entry.content}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No revision history available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
