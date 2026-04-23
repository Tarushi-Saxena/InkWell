'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function PostDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
    if (id) loadPost();
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    const { data: p } = await supabase.from('posts').select('*, profiles:author_id(name,role)').eq('id', id).single();
    setPost(p);

    const { data: c } = await supabase.from('comments').select('*, profiles:user_id(name)').eq('post_id', id).order('created_at', { ascending: true });
    setComments(c || []);
    setLoading(false);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('You must sign in to comment.');
    if (!newComment.trim()) return;

    await supabase.from('comments').insert({
      post_id: id,
      user_id: user.id,
      comment_text: newComment
    });
    setNewComment('');
    loadPost(); // reload comments
  };

  if (loading) return <div className="min-h-screen bg-[#050608] text-white p-20 text-center">Loading post...</div>;
  if (!post) return <div className="min-h-screen bg-[#050608] text-white p-20 text-center">Post not found. <Link href="/" className="underline ml-2">Go back</Link></div>;

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-sm text-white/50 hover:text-white mb-8 transition">
          <ArrowLeft className="h-4 w-4 mr-2"/> Back to feed
        </Link>
        
        {post.image_url && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-8">
            <img src={post.image_url} className="w-full h-full object-cover" alt="Featured" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="text-white/60 text-sm">{post.profiles?.name || 'Unknown Author'}</div>
          <span className="text-white/30">·</span>
          <div className="text-white/60 text-sm">{new Date(post.created_at).toLocaleDateString()}</div>
          {post.profiles?.role && <Badge variant="outline" className="ml-2 text-[10px] capitalize bg-white/5 border-white/10">{post.profiles.role}</Badge>}
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-8 leading-tight">{post.title}</h1>

        {post.summary && (
          <div className="bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/5 to-transparent border border-indigo-500/20 rounded-xl p-6 mb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500"/>
            <div className="flex items-center gap-2 mb-3 text-indigo-300 font-medium tracking-wide uppercase text-xs">
              <Sparkles className="h-4 w-4"/> AI Summary
            </div>
            <p className="text-white/80 leading-relaxed text-sm">{post.summary}</p>
          </div>
        )}

        <div className="prose prose-invert prose-lg max-w-none mb-20 text-white/80 leading-relaxed whitespace-pre-wrap">
          {post.body}
        </div>

        {/* Comments Section */}
        <div className="border-t border-white/10 pt-10">
          <h3 className="text-2xl font-semibold mb-8">Comments ({comments.length})</h3>
          
          <div className="space-y-6 mb-10">
            {comments.map((c) => (
              <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium text-sm text-white/90">{c.profiles?.name || 'Unknown'}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()}</div>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{c.comment_text}</p>
              </div>
            ))}
            {comments.length === 0 && <p className="text-white/40 text-sm">No comments yet. Start the conversation!</p>}
          </div>

          {user ? (
            <form onSubmit={handleComment} className="flex gap-3">
              <input 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                placeholder="Write a comment..." 
                className="flex-1 h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition"
              />
              <Button type="submit" className="h-11 px-6"><Send className="h-4 w-4 mr-2"/>Post</Button>
            </form>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-white/50 text-sm mb-4">You must be signed in to leave a comment.</p>
              <Button variant="outline" onClick={() => router.push('/auth?mode=login')}>Sign In</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
