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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (mode === 'signup') {
      result = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
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
          {mode === 'login' ? 'Welcome Back' : 'Create your account'}
        </h2>
        {error && <div className="mb-4 text-red-400 text-sm p-3 bg-red-400/10 rounded-md border border-red-400/20">{error}</div>}
        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-widest block mb-1.5">Full Name</label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest block mb-1.5">Email</label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" />
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest block mb-1.5">Password</label>
            <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-white/50">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-white hover:text-indigo-300 font-medium transition-colors">
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
      <div className="container mx-auto px-4 py-20">
        <Suspense fallback={<div className="text-center text-white/50">Loading auth...</div>}>
          <AuthContent />
        </Suspense>
      </div>
    </div>
  );
}
