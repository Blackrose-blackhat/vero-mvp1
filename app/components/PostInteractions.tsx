import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toggleReaction } from '../repo_actions';
import {
    MessageSquare,
    Share2,
    Twitter,
    Linkedin,
    Link as LinkIcon,
    Brain,
    GitBranch,
    Zap,
    Shield,
    Plus
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const REACTION_TYPES = [
    { type: 'SKILL', icon: Brain, label: 'Deep Skill', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { type: 'LOGIC', icon: GitBranch, label: 'Clean Logic', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { type: 'SCALABLE', icon: Zap, label: 'Scalable Architecture', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { type: 'ROBUST', icon: Shield, label: 'Robust Build', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

export default function PostInteractions({
    postId,
    initialReactions,
    reactionsByType = {},
    currentUserReaction = null,
    commentCount,
    onCommentToggle,
    repoName,
    repoUrl,
    user
}: {
    postId: number;
    initialReactions: number;
    reactionsByType?: Record<string, number>;
    currentUserReaction?: string | null;
    commentCount: number;
    onCommentToggle: () => void;
    repoName: string;
    repoUrl: string;
    user: any;
}) {
    const [localReactions, setLocalReactions] = useState(initialReactions);
    const [localCounts, setLocalCounts] = useState(reactionsByType);
    const [userReaction, setUserReaction] = useState(currentUserReaction);
    const [showShareModal, setShowShareModal] = useState(false);

    // Sync with props
    useEffect(() => {
        setLocalReactions(initialReactions);
        setLocalCounts(reactionsByType);
        setUserReaction(currentUserReaction);
    }, [initialReactions, reactionsByType, currentUserReaction]);

    const handleReaction = async (type: string) => {
        if (!user) {
            alert('You must be logged in to react to posts.');
            return;
        }

        const isRemoving = userReaction === type;

        // Optimistic UI
        if (isRemoving) {
            setUserReaction(null);
            setLocalReactions(prev => prev - 1);
            setLocalCounts(prev => ({ ...prev, [type]: Math.max(0, (prev[type] || 0) - 1) }));
        } else {
            if (userReaction) {
                setLocalCounts(prev => ({ ...prev, [userReaction]: Math.max(0, (prev[userReaction] || 0) - 1) }));
            } else {
                setLocalReactions(prev => prev + 1);
            }
            setUserReaction(type);
            setLocalCounts(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
        }

        await toggleReaction(postId, type);
    };

    const currentReactionData = REACTION_TYPES.find(r => r.type === userReaction);

    return (
        <div className="relative">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <TooltipProvider>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`font-black uppercase tracking-widest text-[10px] h-10 px-4 transition-all duration-300 rounded-[18px] border border-transparent shadow-none ${userReaction
                                        ? `${currentReactionData?.bg} ${currentReactionData?.color} border-${currentReactionData?.color.split('-')[1]}/20`
                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                                >
                                    {userReaction && currentReactionData ? (
                                        <currentReactionData.icon className="w-4 h-4 mr-2 animate-in zoom-in duration-300" />
                                    ) : (
                                        <Plus className="w-4 h-4 mr-2" />
                                    )}
                                    {localReactions > 0 ? localReactions : 'React'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2 rounded-[24px] bg-card/80 backdrop-blur-xl border-border/40 shadow-2xl flex gap-1 animate-in fade-in zoom-in duration-200" side="top" align="start">
                                {REACTION_TYPES.map((r) => {
                                    const isActive = userReaction === r.type;
                                    const count = localCounts[r.type] || 0;
                                    return (
                                        <Tooltip key={r.type}>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleReaction(r.type)}
                                                    className={`h-11 w-11 rounded-full transition-all duration-300 relative group overflow-visible ${isActive ? `${r.bg} ${r.color} scale-110 shadow-lg shadow-black/5` : 'hover:bg-muted/50'}`}
                                                >
                                                    <r.icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                                    {count > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-background border border-border text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                                            {count}
                                                        </span>
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="rounded-xl font-black uppercase text-[9px] tracking-widest py-1.5 px-3 bg-black text-white border-none shadow-xl">
                                                {r.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </PopoverContent>
                        </Popover>
                    </TooltipProvider>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCommentToggle}
                        className="font-black uppercase tracking-widest text-[10px] h-10 px-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-[18px] transition-all"
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {commentCount}
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShareModal(!showShareModal)}
                    className="font-black uppercase tracking-widest text-[10px] h-10 px-4 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-[18px] transition-all"
                >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </Button>
            </div>

            {showShareModal && (
                <div className="absolute right-0 bottom-14 bg-card/80 backdrop-blur-xl border border-border/40 rounded-[28px] shadow-2xl p-2 flex flex-col gap-1 z-10 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300 min-w-[180px]">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] px-4 py-3">Global Broadcast</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            const text = `Analyzing ${repoName} architecture on Vero! ${repoUrl}`;
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="justify-start text-[11px] font-bold rounded-2xl h-11 px-4 hover:bg-sky-500/10 hover:text-sky-500 transition-colors"
                    >
                        <Twitter className="w-4 h-4 mr-3" /> Twitter
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(repoUrl)}`, '_blank')}
                        className="justify-start text-[11px] font-bold rounded-2xl h-11 px-4 hover:bg-blue-600/10 hover:text-blue-600 transition-colors"
                    >
                        <Linkedin className="w-4 h-4 mr-3" /> LinkedIn
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            navigator.clipboard.writeText(repoUrl);
                            alert('Link copied to architectural clipboard!');
                        }}
                        className="justify-start text-[11px] font-bold rounded-2xl h-11 px-4 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                        <LinkIcon className="w-4 h-4 mr-3" /> Copy Link
                    </Button>
                </div>
            )}
        </div>
    );
}
