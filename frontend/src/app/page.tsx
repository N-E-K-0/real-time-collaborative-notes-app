"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Collaborative Notes
        </h1>
        <p className="text-gray-600 mb-8">
          Create, edit, and collaborate on notes in real time. Join us now!
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/signup">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Signup
            </button>
          </Link>
          <Link href="/login">
            <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
