'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050608]/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
          </div>
          <span className="text-lg">Inkwell</span>
          <span className="ml-2 hidden rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70 sm:inline">AI-powered</span>
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-white/70 hover:text-white transition">Dashboard</Link>
              <button onClick={() => supabase.auth.signOut()} className="text-sm font-medium text-white/40 hover:text-white transition">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth?mode=login" className="text-sm font-medium text-white/70 hover:text-white transition">Sign In</Link>
              <Link href="/auth?mode=signup" className="text-sm font-medium text-black bg-white rounded-md px-3 py-1.5 hover:bg-white/90 transition">Get Started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
