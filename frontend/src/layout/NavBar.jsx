import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const companyName = "DreamNest"; 

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo / Company name */}
          <Link to="/" className="flex items-center space-x-2">
            <svg
              className="h-8 w-8 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xl font-bold text-gray-900">{companyName}</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/help"
              className="text-gray-600 hover:text-indigo-600 transition"
            >
              Help
            </Link>
            <Link
              to="/signin"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-600 hover:text-indigo-600"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/help"
              className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Help
            </Link>
            <Link
              to="/signin"
              className="block px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}