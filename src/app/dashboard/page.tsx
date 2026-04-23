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

        {canWrite ? (
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
              <h2 className="text-xl font-medium mb-6">Manage Posts</h2>
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
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center max-w-lg mx-auto">
            <h2 className="text-xl font-medium mb-2">Viewer Account</h2>
            <p className="text-white/50 text-sm leading-relaxed">You current role is VIEWER. You cannot create posts.</p>
            <p className="text-white/50 text-sm leading-relaxed mt-2">To get author access, an admin needs to manually update your role in the Supabase generic SQL database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
