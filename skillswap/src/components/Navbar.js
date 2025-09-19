import React from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const user = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SkillSwap
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link to="/connections" className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                Connections
              </Link>
              <Link to="/collaboration" className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                Collaboration
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm text-gray-700 hidden sm:block">{user.displayName || user.email}</span>
                <button 
                  onClick={handleLogout} 
                  className="text-sm px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Link to="/signup" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

