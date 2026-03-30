'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Settings } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowProfileMenu(false);
    router.push('/login');
  };

  // Get user initial(s) for avatar
  const getInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 14 4-4" />
              <path d="M3.34 19a10 10 0 1 1 17.32 0" />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
            Inference Optimizer
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {pathname !== '/login' && pathname !== '/signup' && (
            <>
              <Link 
                href="/models" 
                className={`text-sm font-medium transition-colors ${
                  pathname === '/models' 
                    ? 'text-blue-400' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Models
              </Link>

              {user ? (
                // Show profile avatar when logged in
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-semibold hover:shadow-lg hover:shadow-blue-500/40 transition-all cursor-pointer border border-white/10 hover:border-white/20"
                    title={user.email || 'Profile'}
                  >
                    {getInitials()}
                  </button>

                  {/* Profile dropdown menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-900 border border-white/10 shadow-xl z-10">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors hover:bg-white/5"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Show login/signup when not logged in
                <>
                  <Link 
                    href="/login" 
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className="text-sm font-medium px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/5 hover:border-white/10"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
