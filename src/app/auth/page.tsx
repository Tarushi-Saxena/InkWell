'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams?.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError('Login credentials are required.');
    
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        
        // Immediately enforce the correct role into the Database via RLS client-side workaround
        if (data?.user) {
          await supabase.from('profiles').update({ role: role }).eq('id', data.user.id);
        }
        
        if (data?.session) {
           router.refresh();
           router.push('/dashboard');
        } else {
           setError('Account created! Please check your email or refresh to log in.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.refresh();
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/5 border-white/10 mx-auto">
      <CardContent className="p-8">
        <div className="flex justify-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
            <Sparkles className="h-6 w-6"/>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-6 text-center tracking-tight text-white">
          {mode === 'login' ? 'Sign In to your account' : 'Create an account'}
        </h2>
        
        {error && <div className="mb-4 text-red-400 text-sm p-3 bg-red-400/10 rounded-md border border-red-400/20">{error}</div>}
        
        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-widest block mb-1.5">Full Name</label>
                <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" className="border-white/10 bg-[#050608] text-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-widest block mb-1.5">Select Role</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                  className="w-full h-10 rounded-md border border-white/10 bg-[#050608] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                >
                  <option value="Viewer">Viewer (Comment & Read)</option>
                  <option value="Author">Author (Create Posts)</option>
                  <option value="Admin">Admin (Moderate All)</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest block mb-1.5">Email Address</label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@example.com" className="border-white/10 bg-[#050608] text-white" />
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest block mb-1.5">Password</label>
            <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="border-white/10 bg-[#050608] text-white" />
          </div>
          <Button type="submit" className="w-full h-11 text-base mt-5 bg-white text-black hover:bg-white/90" disabled={loading}>
            {loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-white/50">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} type="button" className="text-white hover:text-indigo-300 font-medium transition-colors">
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center items-center">
        <Suspense fallback={<div className="text-center text-white/50">Loading auth...</div>}>
          <AuthContent />
        </Suspense>
      </div>
    </div>
  );
}
