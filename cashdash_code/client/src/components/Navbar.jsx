import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, onSignOut }) {
  return (
    <nav className="w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xl">
                $
              </div>
              <span className="text-xl font-bold text-slate-800">CashDash</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user?.email && (
              <span className="hidden md:block text-sm text-slate-600">
                {user.email}
              </span>
            )}

            <Link
              to="/account"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
              title="Account Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            <button
              onClick={onSignOut}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
