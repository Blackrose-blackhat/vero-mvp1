'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { addComment } from '../repo_actions';
import { CornerDownRight, User, Send } from 'lucide-react';

interface Comment {
    id: number;
    user_email: string;
    content: string;
    parent_id: number | null;
    created_at: string;
}

export default function CommentSection({
    postId,
    comments: initialComments,
    user
}: {
    postId: number;
    comments: Comment[];
    user: any;
}) {
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (parentId?: number) => {
        if (!user) {
            alert('You must be logged in to comment.');
            return;
        }
        if (!newComment.trim()) return;
        setLoading(true);
        const res = await addComment(postId, newComment, parentId);
        if (!res.error) {
            setComments([...comments, {
                id: Date.now(),
                user_email: user.email || 'You',
                content: newComment,
                parent_id: parentId || null,
                created_at: new Date().toISOString()
            }]);
            setNewComment('');
            setReplyTo(null);
        }
        setLoading(false);
    };

    const roots = comments.filter(c => !c.parent_id);

    return (
        <div className="flex flex-col gap-6 mt-6 p-8 bg-muted/30 rounded-[32px] border border-border animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Community Discussion</h4>
                <div className="h-px flex-1 bg-border mx-4 opacity-50" />
            </div>

            <div className="flex flex-col gap-4">
                {roots.map(root => (
                    <div key={root.id} className="flex flex-col gap-4">
                        <div className="flex gap-4 group">
                            <Avatar className="w-8 h-8 border border-border">
                                <AvatarFallback className="bg-background text-[10px] font-bold">
                                    {root.user_email[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-foreground">{root.user_email.split('@')[0]}</span>
                                    <span className="text-[10px] text-muted-foreground font-medium">• {new Date(root.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed bg-background p-4 rounded-2xl rounded-tl-none border border-border">
                                    {root.content}
                                </p>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => setReplyTo(root.id)}
                                    className="h-auto p-0 text-[10px] font-black uppercase text-secondary-foreground/60 hover:text-primary tracking-widest"
                                >
                                    Reply
                                </Button>
                            </div>
                        </div>

                        {/* Replies */}
                        {comments.filter(c => c.parent_id === root.id).map(reply => (
                            <div key={reply.id} className="flex gap-4 pl-12">
                                <CornerDownRight className="w-4 h-4 text-muted-foreground/30 mt-2 shrink-0" />
                                <Avatar className="w-8 h-8 border border-border shrink-0">
                                    <AvatarFallback className="bg-background text-[10px] font-bold">
                                        {reply.user_email[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-foreground">{reply.user_email.split('@')[0]}</span>
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed bg-background p-4 rounded-2xl rounded-tl-none border border-border shadow-sm">
                                        {reply.content}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {replyTo === root.id && (
                            <div className="flex gap-3 pl-12 mt-2 animate-in slide-in-from-left-4 duration-200">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Your reply..."
                                    className="min-h-[80px] rounded-2xl bg-background border-border text-sm focus:ring-1 focus:ring-primary shadow-sm"
                                />
                                <Button
                                    size="icon"
                                    onClick={() => handleSubmit(root.id)}
                                    disabled={loading}
                                    className="h-10 w-10 shrink-0 rounded-xl shadow-lg"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Separator className="my-4 opacity-50" />

            <div className="flex flex-col gap-4">
                {!user ? (
                    <div className="p-6 rounded-2xl bg-muted/50 border border-border border-dashed text-center">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Login to join the technical discussion</p>
                    </div>
                ) : (
                    <div className="flex gap-4 items-start">
                        <Avatar className="w-10 h-10 border border-border shrink-0">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-3">
                            <Textarea
                                value={!replyTo ? newComment : ''}
                                onChange={(e) => !replyTo && setNewComment(e.target.value)}
                                placeholder="Add to the architectural review..."
                                className="min-h-[100px] rounded-[24px] bg-background border-border text-sm resize-none focus:ring-2 focus:ring-primary shadow-sm p-4"
                            />
                            <Button
                                size="icon"
                                onClick={() => handleSubmit()}
                                disabled={loading || !!replyTo}
                                className="h-14 w-14 shrink-0 rounded-[20px] shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                <Send className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
