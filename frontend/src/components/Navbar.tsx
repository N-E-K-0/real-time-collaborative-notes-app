"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function Navbar() {
  const auth = useAuth();

  if (!auth) {
    // The context is not available, so don't render anything.
    return null;
  }

  const { accessToken } = auth;
  // Render nothing if user is not logged in
  if (!accessToken) return null;

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/note/new" className="hover:underline">
            Create Note
          </Link>
        </div>
      </div>
    </nav>
  );
}
