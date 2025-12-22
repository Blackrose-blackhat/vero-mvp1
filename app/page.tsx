import { upsertUserAndLogLogin } from './actions';
import { createSupabaseServerClient } from './supabaseServerClient';
import { getLoginInsights } from './insights';
import { getPublicFeed } from './repo_actions';
import PostCard from './components/PostCard';
import { Code2, Globe } from 'lucide-react';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Log user login and upsert user info (server-side)
  await upsertUserAndLogLogin();

  const { posts, error: feedError } = await getPublicFeed();
  const insights = await getLoginInsights();

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 relative z-10">
        <header className="mb-16 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-primary italic">
              Global Feed
            </h1>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground uppercase italic decoration-primary/20 decoration-8 underline-offset-4 underline">
                Architecture <br /> Publications
              </h2>
              <p className="text-muted-foreground font-bold text-sm max-w-md leading-relaxed">
                Deep-dive architectural reviews and implementation insights from the global developer network.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="px-6 py-4 rounded-3xl bg-card/40 border border-border/40 backdrop-blur-md flex flex-col gap-1">
                <span className="text-2xl font-black text-foreground italic">{insights.todayLogins || 0}</span>
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Active Nodes</span>
              </div>
              <div className="px-6 py-4 rounded-3xl bg-card/40 border border-border/40 backdrop-blur-md flex flex-col gap-1">
                <span className="text-2xl font-black text-foreground italic">{posts?.length || 0}</span>
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Reviews</span>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-12">
          {feedError ? (
            <div className="p-12 rounded-[40px] border border-red-500/20 bg-red-500/5 text-center">
              <p className="text-sm font-bold text-red-500 uppercase tracking-widest">Failed to initialize node handshake.</p>
              <p className="text-xs text-red-500/60 mt-2">{feedError}</p>
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="p-20 text-center rounded-[40px] border-2 border-dashed border-border/40 bg-muted/5">
              <Code2 className="w-12 h-12 text-muted-foreground/20 mx-auto mb-6" />
              <p className="text-sm font-bold text-muted-foreground italic uppercase tracking-widest">The network is silent. No publications detected.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12">
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} currentUser={user} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
