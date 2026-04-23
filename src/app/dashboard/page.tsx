'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAiSummaryAction } from '@/app/actions';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        loadProfileAndPosts(user.id);
      }
    });
  }, [router]);

  const loadProfileAndPosts = async (userId: string) => {
    setLoading(true);
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(prof);

    const role = prof?.role?.toUpperCase() || 'VIEWER';
    let q = supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (role !== 'ADMIN') {
      q = q.eq('author_id', userId);
    }
    const { data } = await q;
    setPosts(data || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const current = posts.find(p => p.id === editingId);
        let updatedSummary = current.summary;
        if (current.body !== body) {
          updatedSummary = await getAiSummaryAction(body);
        }
        await supabase.from('posts').update({ title, body, image_url: imageUrl, summary: updatedSummary }).eq('id', editingId);
      } else {
        const summary = await getAiSummaryAction(body);
        await supabase.from('posts').insert({
          title, body, image_url: imageUrl, summary, author_id: user.id
        });
      }
      
      setTitle(''); setBody(''); setImageUrl(''); setEditingId(null);
      await loadProfileAndPosts(user.id);
    } catch (err) {
      console.error(err);
      alert('Error saving post');
    }
    setSaving(false);
  };

  const handleSeed = async () => {
    if (!confirm('This will insert 3 sample posts. Continue?')) return;
    setSaving(true);
    const samplePosts = [
      {
        title: 'The Dawn of Artificial General Intelligence',
        body: 'As we stand on the precipice of a new era, Artificial General Intelligence (AGI) promises to reshape the very fabric of our existence. Unlike narrow AI, which excels at specific tasks, AGI points toward machines that equal or exceed human intelligence across a wide range of cognitive domains. The implications stretch from solving climate change to autonomous scientific discovery.',
        summary: 'Artificial General Intelligence (AGI) represents a monumental leap over narrow AI, possessing human-like cognitive abilities across diverse domains. As AGI research accelerates, it holds the potential to revolutionize fields from healthcare to quantum physics, though it also necessitates rigorous ethical frameworks and alignment protocols.',
        image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1600'
      },
      {
        title: 'Quantum Computing: Beyond the Qubit',
        body: 'Quantum computing leverages the mind-bending properties of quantum mechanics—superposition and entanglement—to process information in ways classical computers cannot. While conventional bits are strictly 0 or 1, qubits can exist in multiple states simultaneously, unlocking exponential processing power that will soon break current encryption standards.',
        summary: 'Quantum mechanics enables processing power far beyond classical thresholds through qubits and entanglement. This post explores the timeline for quantum supremacy and how industries are proactively preparing for the incoming paradigm shift in computational speed, cryptography, and molecular modeling.',
        image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1600'
      },
      {
        title: 'Neural Interfaces and the Meta-Consciousness',
        body: 'The integration of brain-computer interfaces (BCIs) is transitioning from medical rehabilitation to mainstream augmentation. As companies pilot high-bandwidth neural implants, the horizon of human-to-machine communication expands. We are no longer limited by the speed of our thumbs; thoughts themselves become the ultimate input device.',
        summary: 'Brain-computer interfaces are redefining human limitations by establishing direct neural links to digital environments. As bandwidth caps vanish, cognitive augmentation promises to seamlessly merge human intent with artificial processing power, presenting profound existential and privacy considerations.',
        image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600'
      }
    ];

    try {
      for (const p of samplePosts) {
        await supabase.from('posts').insert({ ...p, author_id: user.id });
      }
      await loadProfileAndPosts(user.id);
    } catch (err) {
      console.error(err);
      alert('Seeding failed.');
    }
    setSaving(false);
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setTitle(p.title);
    setBody(p.body);
    setImageUrl(p.image_url || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete post?')) return;
    await supabase.from('posts').delete().eq('id', id);
    loadProfileAndPosts(user.id);
  };

  if (loading) return <div className="min-h-screen bg-[#050608] text-white p-20 text-center">Loading dashboard...</div>;

  const canWrite = profile?.role?.toUpperCase() === 'ADMIN' || profile?.role?.toUpperCase() === 'AUTHOR';

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-white/50 mt-1">Signed in as <span className="text-white">{profile?.name}</span> ({profile?.role})</p>
          </div>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}>Sign Out</Button>
        </div>

        {canWrite && (
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Editor */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-fit">
              <h2 className="text-xl font-medium mb-6">{editingId ? 'Edit Post' : 'Create New Post'}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-sm text-white/50 block mb-1">Title</label>
                  <Input required value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-white/50 block mb-1">Featured Image URL (optional)</label>
                  <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-white/50 block mb-1">Body Content</label>
                  <textarea required value={body} onChange={e => setBody(e.target.value)} className="w-full h-40 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? 'Processing with AI...' : (editingId ? 'Update Post' : 'Publish Post')}
                  </Button>
                  {editingId && <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setTitle(''); setBody(''); setImageUrl(''); }}>Cancel</Button>}
                </div>
              </form>
            </div>

            {/* List */}
            <div>
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-medium">Manage Posts</h2>
                 {profile?.role?.toUpperCase() === 'ADMIN' && (
                    <Button onClick={handleSeed} variant="outline" size="sm" className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10">Seed Sample Data</Button>
                 )}
              </div>
              <div className="space-y-3">
                {posts.map(p => (
                   <div key={p.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center group hover:bg-white/5 transition gap-3">
                     <div>
                       <h3 className="font-medium text-sm leading-snug">{p.title}</h3>
                       <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{new Date(p.created_at).toLocaleDateString()}</p>
                     </div>
                     <div className="flex gap-2 w-full sm:w-auto">
                       <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => handleEdit(p)}>Edit</Button>
                       <Button size="sm" variant="ghost" className="flex-1 sm:flex-none text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(p.id)}>Delete</Button>
                     </div>
                   </div>
                ))}
                {posts.length === 0 && <p className="text-white/40 text-sm">No posts yet.</p>}
              </div>
            </div>
          </div>
        )}
        {!canWrite && (
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Viewer Profile Details */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 h-fit">
              <h2 className="text-xl font-medium mb-4">Your Profile</h2>
              <div className="space-y-4 text-sm text-white/70">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 uppercase tracking-widest text-[10px]">Name</span>
                  <span className="font-medium text-white">{profile?.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 uppercase tracking-widest text-[10px]">Email</span>
                  <span className="font-medium text-white">{profile?.email}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 uppercase tracking-widest text-[10px]">Role Status</span>
                  <span className="font-medium text-emerald-400">Active Viewer</span>
                </div>
              </div>
            </div>

            {/* Viewer Feed / Action */}
            <div className="bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 border border-white/10 rounded-xl p-8">
              <h2 className="text-xl font-medium mb-2 text-white">Welcome to Inkwell</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">As a Viewer, you have full access to explore the feed, read our AI-generated post summaries, and leave comments on any article. Upgrading to an Author requires backend authorization.</p>
              
              <Button onClick={() => router.push('/')} variant="secondary" className="bg-white text-black hover:bg-white/90">
                Explore The Feed
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
