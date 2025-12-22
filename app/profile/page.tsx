import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../supabaseServerClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Github, ExternalLink, Calendar, Code2, Globe, Settings, MapPin, Mail } from 'lucide-react';
import PostCard from '../components/PostCard';

export default async function ProfilePage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    const { data: userPosts } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            {/* Profile Header Banner */}
            <div className="h-48 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-[grid-white/[0.02]] bg-[size:32px_32px]" />
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="max-w-5xl mx-auto px-6 sm:px-10 -mt-20 relative z-10 pb-20">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Left Column: Profile Info */}
                    <div className="w-full md:w-80 flex flex-col gap-8 shrink-0">
                        <Card className="rounded-[40px] border-border/40 bg-card/60 backdrop-blur-xl p-8 shadow-2xl shadow-primary/5">
                            <div className="flex flex-col items-center text-center gap-6">
                                <Avatar className="w-32 h-32 border-4 border-background shadow-2xl shadow-primary/10">
                                    <AvatarImage src={user.user_metadata?.avatar_url} />
                                    <AvatarFallback className="text-4xl font-black bg-primary/5 text-primary italic">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-1.5">
                                    <h1 className="text-2xl font-black tracking-tight text-foreground uppercase italic tracking-tighter decoration-primary/20 decoration-4 underline-offset-4 underline">
                                        {user.user_metadata?.full_name || 'Architect'}
                                    </h1>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Code2 className="w-3 h-3 text-primary" />
                                        Senior Developer
                                    </p>
                                </div>

                                <Separator className="w-full opacity-30" />

                                <div className="w-full space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground/80 lowercase tracking-tight">
                                        <Mail className="w-3.5 h-3.5 text-primary/60" />
                                        {user.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground/80 lowercase tracking-tight">
                                        <Globe className="w-3.5 h-3.5 text-primary/60" />
                                        github.com/{user.user_metadata?.user_name || 'dev'}
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground/80 lowercase tracking-tight">
                                        <MapPin className="w-3.5 h-3.5 text-primary/60" />
                                        Distributed Node
                                    </div>
                                </div>

                                <Button className="w-full rounded-2xl h-11 font-black uppercase tracking-widest shadow-xl shadow-primary/10 transition-all hover:scale-[1.02]">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Account Prefs
                                </Button>
                            </div>
                        </Card>

                        {/* Profile Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="rounded-[28px] p-5 border-border/40 bg-card/40 flex flex-col items-center gap-1">
                                <span className="text-xl font-black text-foreground">{userPosts?.length || 0}</span>
                                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Publications</span>
                            </Card>
                            <Card className="rounded-[28px] p-5 border-border/40 bg-card/40 flex flex-col items-center gap-1">
                                <span className="text-xl font-black text-foreground">0</span>
                                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Interactions</span>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="flex-1 w-full flex flex-col gap-10">
                        <Tabs defaultValue="publications" className="w-full">
                            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 scrollbar-none">
                                <TabsList className="bg-muted/40 p-1.5 rounded-[20px] h-12 border border-border/30">
                                    <TabsTrigger value="publications" className="rounded-2xl px-8 h-9 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                                        Publications
                                    </TabsTrigger>
                                    <TabsTrigger value="activity" className="rounded-2xl px-8 h-9 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                                        Activity
                                    </TabsTrigger>
                                    <TabsTrigger value="about" className="rounded-2xl px-8 h-9 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                                        About
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="publications" className="mt-0 focus-visible:outline-none">
                                <div className="space-y-10">
                                    {(!userPosts || userPosts.length === 0) ? (
                                        <Card className="p-20 text-center rounded-[40px] border-2 border-dashed border-border/40 bg-muted/10">
                                            <Code2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-muted-foreground italic uppercase tracking-widest">No architectural publications yet.</p>
                                            <Button variant="link" asChild className="mt-4 text-primary font-black uppercase tracking-widest text-[11px]">
                                                <Link href="/create">Start Analyzing →</Link>
                                            </Button>
                                        </Card>
                                    ) : (
                                        userPosts.map((post: any) => (
                                            <PostCard key={post.id} post={post} currentUser={user} />
                                        ))
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="activity">
                                <Card className="p-20 text-center rounded-[40px] border border-border/40 bg-muted/5">
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Recent activity history is encrypted.</p>
                                </Card>
                            </TabsContent>

                            <TabsContent value="about">
                                <Card className="p-12 rounded-[40px] border border-border/40 bg-card/40 space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-black uppercase text-foreground tracking-widest italic decoration-primary/20 decoration-2 underline">Technical Overview</h3>
                                        <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                                            Professional architectural reviewer specializing in identifying scalability bottlenecks and implementation patterns across distributed systems.
                                            Currently maintaining a collection of deep technical insights on GitHub's leading repositories.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/20">
                                            <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Stack Specialty</p>
                                            <p className="text-xs font-bold text-foreground">Distributed Architecture</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/20">
                                            <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Verification Level</p>
                                            <p className="text-xs font-bold text-foreground">Senior Core Reviewer</p>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { Separator } from "@/components/ui/separator";
