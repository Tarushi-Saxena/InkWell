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

  const handleDemoLogin = async (demoRole: string) => {
    setLoading(true);
    setError('');
    const demoEmail = `${demoRole.toLowerCase()}@inkwell.com`;
    const demoPassword = 'Password123!';

    try {
      // Attempt login
      let { data, error } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPassword });
      
      // If user doesn't exist, create it automatically behind the scenes
      if (error && error.message.includes('Invalid login credentials')) {
        const signupRes = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: { data: { full_name: `${demoRole} Demo`, role: demoRole } }
        });
        if (signupRes.error) throw signupRes.error;
      } else if (error) {
        throw error;
      }
      
      router.refresh();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (mode === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, role: role } }
        });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      if (result.error) {
        setError(result.error.message);
      } else if (mode === 'signup' && !result.data.session) {
        setError('Please check your email to confirm your account. In a local environment, this might be bypassed.');
        setTimeout(() => setMode('login'), 2000);
      } else {
        router.refresh();
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
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
          {mode === 'login' ? 'Welcome Back' : 'Create your account'}
        </h2>
        
        {/* Fast Demo Login Section */}
        {mode === 'login' && (
          <div className="mb-6 pb-6 border-b border-white/10">
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest block mb-3 text-center">One-Click Demo Login</label>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => handleDemoLogin('Viewer')} type="button" variant="secondary" size="sm" className="bg-white/10 text-white hover:bg-white/20 h-9">Viewer</Button>
              <Button onClick={() => handleDemoLogin('Author')} type="button" variant="secondary" size="sm" className="bg-white/10 text-emerald-300 hover:bg-white/20 h-9">Author</Button>
              <Button onClick={() => handleDemoLogin('Admin')} type="button" variant="secondary" size="sm" className="bg-white/10 text-indigo-300 hover:bg-white/20 h-9">Admin</Button>
            </div>
          </div>
        )}

        {error && <div className="mb-4 text-red-400 text-sm p-3 bg-red-400/10 rounded-md border border-red-400/20">{error}</div>}
        
        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-widest block mb-1.5">Full Name</label>
                <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" className="border-white/10 bg-white/5" />
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-widest block mb-1.5">Select Role</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                  className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                >
                  <option value="Viewer" className="bg-black">Viewer</option>
                  <option value="Author" className="bg-black">Author</option>
                  <option value="Admin" className="bg-black">Admin</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest block mb-1.5">{mode === 'signup' ? 'Email' : 'Or use manual email'}</label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@example.com" className="border-white/10 bg-white/5" />
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest block mb-1.5">Password</label>
            <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="border-white/10 bg-white/5" />
          </div>
          <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-white/50">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="text-white hover:text-indigo-300 font-medium transition-colors">
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
