"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import socket from "../../../lib/socket";

export default function NoteEditor() {
  const { id } = useParams();
  const [note, setNote] = useState({ title: "", content: "", history: [] });
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchNote() {
      const token = localStorage.getItem("accessToken");
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notes/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setNote(res.data);
      } catch (err: any) {
        console.error("Error fetching note", err);
        setError("Failed to fetch note");
      }
    }

    fetchNote();

    // Join the note room
    socket.emit("joinNote", { noteId: id, user: "TestUser" }); // Replace with actual user info

    // Listen for updates
    socket.on("noteUpdated", (data) => {
      if (data.noteId === id) {
        setNote((prev) => ({ ...prev, content: data.content }));
      }
    });

    // Listen for presence events
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
  }, [id]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedContent = e.target.value;
    setNote((prev) => ({ ...prev, content: updatedContent }));
    socket.emit("noteUpdate", {
      noteId: id,
      content: updatedContent,
      user: "TestUser",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {note.title || "Untitled Note"}
        </h2>
        <textarea
          value={note.content}
          onChange={handleContentChange}
          className="w-full h-64 border p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Start writing your note..."
        />
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
            <p className="text-gray-500">No other users editing this note.</p>
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
  );
}
