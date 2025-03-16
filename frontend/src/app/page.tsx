"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notes`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotes(res.data);
      } catch (err) {
        console.error("Error fetching notes", err);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-3xl mb-4">My Notes</h2>
      <ul>
        {notes.map((note) => (
          <li key={note._id} className="mb-2">
            <Link href={`/note/${note._id}`}>
              <a className="text-blue-600 underline">{note.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
