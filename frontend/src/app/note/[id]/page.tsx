// pages/note/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../../../lib/socket";

export default function NoteEditor() {
  const router = useRouter();
  const { id } = router.query;
  const [note, setNote] = useState({ title: "", content: "", history: [] });
  const [activeUsers, setActiveUsers] = useState([]);
  const [user] = useState("TestUser"); // Replace with actual user info from auth

  useEffect(() => {
    if (!id) return;

    // Fetch note details
    const fetchNote = async () => {
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
      } catch (err) {
        console.error("Error fetching note", err);
      }
    };

    fetchNote();

    // Join the note room
    socket.emit("joinNote", { noteId: id, user });

    // Listen for real-time updates
    socket.on("noteUpdated", (data) => {
      if (data.noteId === id) {
        setNote((prev) => ({ ...prev, content: data.content }));
      }
    });

    // Listen for presence events
    socket.on("userJoined", (data) => {
      if (data.noteId === id) {
        setActiveUsers((prev) => [...prev, data.user]);
      }
    });
    socket.on("userLeft", (data) => {
      if (data.noteId === id) {
        setActiveUsers((prev) => prev.filter((u) => u !== data.user));
      }
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leaveNote", { noteId: id, user });
      socket.off("noteUpdated");
      socket.off("userJoined");
      socket.off("userLeft");
    };
  }, [id, user]);

  const handleContentChange = (e) => {
    const updatedContent = e.target.value;
    setNote((prev) => ({ ...prev, content: updatedContent }));
    // Emit the update event to the backend
    socket.emit("noteUpdate", { noteId: id, content: updatedContent, user });
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl mb-4">{note.title}</h2>
      <textarea
        value={note.content}
        onChange={handleContentChange}
        className="w-full h-64 border p-2"
      />
      <div className="mt-4">
        <h4 className="text-xl">Active Users:</h4>
        <ul>
          {activeUsers.map((u, index) => (
            <li key={index}>{u}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h4 className="text-xl">Revision History:</h4>
        <ul>
          {note.history.map((entry, index) => (
            <li key={index}>
              <span>{new Date(entry.updatedAt).toLocaleString()}:</span>{" "}
              {entry.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
