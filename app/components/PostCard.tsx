'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User, ExternalLink, MessageSquare, Heart, Share2, Code2, Trash, MoreVertical, Search, Quote } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePost } from '../repo_actions';
import PostInteractions from './PostInteractions';
import CommentSection from './CommentSection';
import AnswerEditor from './AnswerEditor';

export default function PostCard({ post, currentUser, interactions }: { post: any; currentUser?: any; interactions?: any }) {
    const [showComments, setShowComments] = useState(false);
    const [showAnswerEditor, setShowAnswerEditor] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const interactionsData = interactions;

    // Interactions are now passed as props from server component

    const isOwner = currentUser?.id === post.user_id;

    const handleDelete = async () => {
        if (confirm('Are you certain you want to remove this architectural publication?')) {
            setIsDeleting(true);
            // Call server action deletePostAction (to be implemented)
            const res = await deletePost(post.id);
            if (res?.error) {
                alert(res.error);
                setIsDeleting(false);
            } else {
                // Optionally refresh or navigate
                window.location.reload();
            }
        }
    };

    if (isDeleting) return null;

    return (
        <Card className="rounded-[40px] overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <CardHeader className="p-10 pb-6 relative z-10">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300">
                                <Code2 className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight underline decoration-primary/20 decoration-4 underline-offset-8 truncate group-hover:decoration-primary/40 transition-all duration-300">
                                {post.repo_name}
                            </CardTitle>
                            <Button variant="ghost" size="icon" asChild className="rounded-full h-8 w-8 hover:bg-primary/10">
                                <a
                                    href={post.repo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </a>
                            </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground/60 truncate font-bold tracking-tight px-0.5">
                            {post.repo_url}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.1em] py-1.5 px-4 rounded-full flex items-center gap-2 border-border/60 bg-muted/30">
                                <Calendar className="w-3 h-3 text-primary/60" />
                                {new Date(post.created_at).toLocaleDateString()}
                            </Badge>
                            {isOwner && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl">
                                        <DropdownMenuItem onClick={handleDelete} className="text-red-500 font-bold focus:text-red-500 focus:bg-red-500/10 rounded-xl cursor-pointer">
                                            <Trash className="w-4 h-4 mr-2" />
                                            Delete Post
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                        <div className="flex items-center gap-2 px-1">
                            <Link
                                href={`/profile/${post.user_id}`}
                                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 hover:text-primary transition-colors"
                            >
                                {post.users?.name || post.user_email?.split('@')[0] || 'Architect'}
                            </Link>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-10 py-6 space-y-10 relative z-10">
                <div className="space-y-12">
                    {post.questions.map((q: string, i: number) => (
                        <div key={i} className="group/qa relative space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${i * 150}ms` }}>
                            {/* Question Layer */}
                            <div className="flex gap-6 items-start">
                                <div className="w-10 h-10 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover/qa:bg-primary/10 transition-colors duration-500">
                                    <Search className="w-4 h-4 text-primary/60" />
                                </div>
                                <div className="space-y-1 pt-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 block mb-1">Inquiry 0{i + 1}</span>
                                    <h3 className="text-[15px] font-black text-foreground leading-snug italic tracking-tight">
                                        "{q}"
                                    </h3>
                                </div>
                            </div>

                            {/* Answer Layer */}
                            {interactionsData?.answers?.answers?.[i] ? (
                                <div className="ml-16 relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-full" />
                                    <div className="pl-8 space-y-4">
                                        <div className="p-8 bg-muted/10 rounded-[40px] border border-border/20 backdrop-blur-sm shadow-sm group-hover/qa:bg-muted/15 transition-all duration-500 relative overflow-hidden">
                                            <Quote className="absolute -top-2 -right-2 w-20 h-20 text-primary opacity-[0.03] rotate-12" />
                                            <p className="text-[13px] text-foreground/75 font-medium leading-relaxed italic relative z-10">
                                                {interactions.answers.answers[i]}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 px-2">
                                            <Link href={`/profile/${post.user_id}`} className="flex -space-x-2 transition-transform hover:scale-110">
                                                <Avatar className="w-5 h-5 border border-background">
                                                    <AvatarImage src={post.users?.avatar_url || post.user_avatar} />
                                                    <AvatarFallback className="text-[8px] bg-primary/20 text-primary">{(post.users?.email || post.user_email)?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                                </Avatar>
                                            </Link>
                                            <Badge className="bg-primary/5 text-primary border-primary/10 text-[8px] font-black uppercase tracking-[0.2em] py-1 px-3 rounded-full flex items-center gap-1.5 font-outline shadow-none">
                                                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                                Verified Architecture
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="ml-16 pl-8">
                                    <div className="p-6 rounded-[30px] border border-dashed border-border/40 bg-muted/5 flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic leading-none">Awaiting Architectural Review</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {isOwner && !interactions?.answers && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAnswerEditor(!showAnswerEditor)}
                        className="w-full h-12 justify-center text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-[20px] border border-border/40 border-dashed"
                    >
                        {showAnswerEditor ? '− Close Editor' : '+ Add Architectural Review'}
                    </Button>
                )}

                {showAnswerEditor && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <AnswerEditor
                            postId={post.id}
                            questions={post.questions}
                            initialAnswers={interactions?.answers?.answers || []}
                            onSuccess={() => {
                                setShowAnswerEditor(false);
                                window.location.reload();
                            }}
                        />
                    </div>
                )}
            </CardContent>

            <CardFooter className="px-10 py-8 border-t border-border/30 bg-muted/10 relative z-10">
                <div className="w-full">
                    <PostInteractions
                        postId={post.id}
                        initialReactions={interactionsData?.reactionsCount || 0}
                        reactionsByType={interactionsData?.reactionsByType || {}}
                        currentUserReaction={interactionsData?.currentUserReaction}
                        commentCount={interactionsData?.comments?.length || 0}
                        onCommentToggle={() => setShowComments(!showComments)}
                        repoName={post.repo_name}
                        repoUrl={post.repo_url}
                        user={currentUser}
                    />

                    {showComments && interactionsData && (
                        <div className="mt-8 animate-in fade-in slide-in-from-top-6 duration-500">
                            <CommentSection postId={post.id} comments={interactionsData.comments} user={currentUser} />
                        </div>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
