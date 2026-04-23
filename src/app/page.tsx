'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search, Sparkles, Loader2, ChevronLeft, ChevronRight,
  Zap, Brain, BookText, ArrowRight, Stars, Clock, Users
} from 'lucide-react';

const PAGE_SIZE = 6;

function App() {
  const [posts, setPosts] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ posts: 0, summaries: 0, authors: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let q = supabase
      .from('posts')
      .select('id,title,summary,image_url,created_at,author_id,profiles:author_id(name,role)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (searchTerm) q = q.or(`title.ilike.%${searchTerm}%,body.ilike.%${searchTerm}%`);
    const { data, count } = await q;
    setPosts(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [page, searchTerm]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    (async () => {
      const { data: feat } = await supabase
        .from('posts')
        .select('id,title,summary,image_url,created_at,profiles:author_id(name,role)')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(3);
      setFeatured(feat || []);

      const { count: pc } = await supabase.from('posts').select('*', { count: 'exact', head: true });
      const { count: sc } = await supabase.from('posts').select('*', { count: 'exact', head: true }).not('summary','is',null);
      const { count: ac } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setStats({ posts: pc || 0, summaries: sc || 0, authors: ac || 0 });
    })();
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020205] text-white">
      {/* 3D Animated Grid Background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden perspective-1000">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
        
        {/* Floor 3D Grid */}
        <div className="absolute bottom-[-20%] left-[-50%] right-[-50%] h-[70vh] origin-bottom" style={{ transform: 'rotateX(75deg) scale(1.5)' }}>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.15)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-flow" />
          {/* Edge fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#020205]" />
        </div>
      </div>

      <Navbar />

      <main className="container mx-auto px-4 relative py-14 sm:py-20">
        {/* HERO */}
        <section className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"/>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"/>
            </span>
            Live · Powered by Gemini 2.5 Flash
          </div>
          <h1 className="mb-5 text-5xl font-semibold tracking-tight sm:text-7xl">
            <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">Stories,</span>{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">summarized</span>
            <br/>
            <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">before you scroll.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            A blogging platform where every post is instantly distilled into a <span className="text-white">crisp AI summary</span>.
            Skim the universe. Dive into what matters.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth?mode=signup">
              <Button size="lg" className="group relative overflow-hidden bg-white px-6 text-black hover:bg-white/90">
                <Sparkles className="mr-2 h-4 w-4"/>Start writing free
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1"/>
              </Button>
            </Link>
            <a href="#feed"><Button size="lg" variant="ghost" className="border border-white/15 bg-white/5 text-white hover:bg-white/10">Read the feed</Button></a>
          </div>

          {/* Stats strip */}
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur">
            {[
              { label: 'Posts', value: stats.posts, icon: BookText },
              { label: 'AI Summaries', value: stats.summaries, icon: Brain },
              { label: 'Writers', value: stats.authors, icon: Users },
            ].map((s) => (
              <div key={s.label} className="rounded-xl px-4 py-3 text-left">
                <div className="mb-1 flex items-center gap-1 text-[10px] sm:text-xs uppercase tracking-wider text-white/40">
                  <s.icon className="h-3 w-3"/>{s.label}
                </div>
                <div className="text-2xl font-semibold">{s.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-24">
          <div className="mb-10 text-center">
            <div className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">How it works</div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Three steps. Zero friction.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n: '01', t: 'Write', d: 'Draft a post with a title, featured image, and body. No word limits, no writer’s block tax.', icon: BookText },
              { n: '02', t: 'Summarize', d: 'Gemini 2.5 Flash condenses your post into a crisp summary in seconds.', icon: Brain },
              { n: '03', t: 'Publish', d: 'Summary stored alongside your post. Readers skim the feed or dive into the full piece.', icon: Zap },
            ].map((s) => (
              <div key={s.n} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6 transition hover:border-white/20">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 blur-2xl transition group-hover:opacity-100"/>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <s.icon className="h-5 w-5 text-white/80"/>
                  </div>
                  <span className="font-mono text-xs text-white/30">{s.n}</span>
                </div>
                <h3 className="mb-1 text-lg font-semibold">{s.t}</h3>
                <p className="text-sm leading-relaxed text-white/60">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURED */}
        {featured.length > 0 && (
          <section className="mt-24">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-widest text-white/40">Featured</div>
                <h2 className="text-3xl font-semibold tracking-tight">Hand-picked reads</h2>
              </div>
              <div className="hidden items-center gap-1 text-xs text-white/40 sm:flex"><Stars className="h-3 w-3"/>Updated live from the database</div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {featured.map((p, i) => (
                <Link key={p.id} href={`/posts/${p.id}`} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-white/25">
                  {p.image_url && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={p.image_url} alt={p.title} className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/30 to-transparent"/>
                      {i === 0 && <Badge className="absolute left-4 top-4 border-0 bg-white/10 text-white backdrop-blur">Latest</Badge>}
                    </div>
                  )}
                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-2 text-xs text-white/50">
                      <span>{p.profiles?.name}</span>
                      <span>·</span>
                      <Clock className="h-3 w-3"/>
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold leading-snug text-white group-hover:text-white">{p.title}</h3>
                    <div className="mb-2 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-indigo-300"><Sparkles className="h-3 w-3"/>AI Summary</div>
                    <p className="line-clamp-3 text-sm leading-relaxed text-white/60">{p.summary || 'Summary being generated...'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FEED */}
        <section id="feed" className="mt-24">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-widest text-white/40">All posts</div>
              <h2 className="text-3xl font-semibold tracking-tight">The feed</h2>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setPage(0); setSearchTerm(query); }} className="flex w-full max-w-md items-center gap-2 sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"/>
                <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search..." className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/40"/>
              </div>
              <Button type="submit" variant="secondary" className="border-white/10 bg-white/10 text-white hover:bg-white/15">Search</Button>
              {searchTerm && <Button type="button" variant="ghost" className="text-white/60 hover:bg-white/10" onClick={()=>{ setQuery(''); setSearchTerm(''); setPage(0); }}>Clear</Button>}
            </form>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-white/40"/></div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-20 text-center text-white/50">No posts yet. Be the first to write one.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <Link key={p.id} href={`/posts/${p.id}`} className="group">
                  <Card className="h-full overflow-hidden border-white/10 bg-white/[0.03] transition hover:border-white/25 hover:bg-white/[0.05]">
                    {p.image_url ? (
                      <div className="aspect-video overflow-hidden bg-white/5">
                        <img src={p.image_url} alt={p.title} className="h-full w-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-100"/>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-cyan-500/20"/>
                    )}
                    <CardContent className="p-5">
                      <div className="mb-2 flex items-center gap-2 text-xs text-white/50">
                        <span>{p.profiles?.name || 'Unknown'}</span>
                        <span>·</span>
                        <span>{new Date(p.created_at).toLocaleDateString()}</span>
                        {p.profiles?.role && <Badge variant="outline" className="ml-auto border-white/15 capitalize text-white/70">{p.profiles.role}</Badge>}
                      </div>
                      <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-white">{p.title}</h3>
                      <div className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-indigo-300"><Sparkles className="h-3 w-3"/>AI Summary</div>
                      <p className="line-clamp-4 text-sm leading-relaxed text-white/60">{p.summary || 'Summary pending — open the post and regenerate.'}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-white hover:bg-white/10" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p-1))}><ChevronLeft className="h-4 w-4"/></Button>
              <span className="text-sm text-white/50">Page {page+1} of {totalPages}</span>
              <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-white hover:bg-white/10" disabled={page+1 >= totalPages} onClick={() => setPage(p => p+1)}><ChevronRight className="h-4 w-4"/></Button>
            </div>
          )}
        </section>

        <footer className="mt-24 border-t border-white/10 pt-8 text-center text-xs text-white/40">
          Built with Next.js · Supabase · Gemini 2.5 Flash
        </footer>
      </main>
    </div>
  );
}

export default App;
