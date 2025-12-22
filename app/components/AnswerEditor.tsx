import { useState, useEffect } from 'react';
import { createAnswer } from '../repo_actions';
import { Send, CheckCircle2, GraduationCap, Code2, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export default function AnswerEditor({
    postId,
    questions,
    initialAnswers = [],
    onSuccess
}: {
    postId: number;
    questions: string[];
    initialAnswers?: string[];
    onSuccess: () => void;
}) {
    // Initialize with initialAnswers if provided, otherwise empty strings
    const [answers, setAnswers] = useState<string[]>(
        initialAnswers.length > 0 ? initialAnswers : ['', '', '']
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleUpdate = (index: number, val: string) => {
        const next = [...answers];
        next[index] = val;
        setAnswers(next);
    };

    const handleSubmit = async () => {
        if (answers.some(a => !a.trim())) {
            setError('Please provide a complete architectural response for all questions.');
            return;
        }
        setLoading(true);
        const res = await createAnswer(postId, answers);
        if (res.error) {
            setError(res.error);
        } else {
            setSubmitted(true);
            setTimeout(onSuccess, 1500);
        }
        setLoading(false);
    };

    const [activeTab, setActiveTab] = useState("0");

    const progress = (answers.filter(a => a.trim()).length / questions.length) * 100;

    const stepInfo = [
        { icon: <Zap className="w-4 h-4" />, label: "Scalability", color: "bg-amber-500/10 text-amber-600" },
        { icon: <Code2 className="w-4 h-4" />, label: "Tech Stack", color: "bg-primary/10 text-primary" },
        { icon: <Shield className="w-4 h-4" />, label: "Security", color: "bg-blue-500/10 text-blue-600" },
    ];

    if (submitted) {
        return (
            <div className="flex flex-col items-center gap-8 py-24 text-primary animate-in zoom-in duration-700 text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse shadow-inner">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic underline decoration-primary decoration-4 underline-offset-8">Review Committed</h3>
                    <p className="font-bold text-[11px] text-muted-foreground uppercase tracking-[0.2em] opacity-60 italic max-w-xs leading-relaxed">Your architectural insights have been synchronized with the global network.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 mt-12 p-10 sm:p-14 bg-card/40 rounded-[60px] border border-border/30 shadow-2xl shadow-primary/5 group/editor transition-all duration-700 relative overflow-hidden backdrop-blur-xl">
            {/* Decorative background icon */}
            <div className="absolute -top-6 -right-6 p-12 opacity-5 group-hover/editor:opacity-10 transition-opacity duration-700 rotate-12">
                <GraduationCap className="w-48 h-48" />
            </div>

            <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[24px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                            <GraduationCap className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-foreground uppercase tracking-tighter italic">Architectural Review</h4>
                            <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 tracking-[0.2em]">Deep-Dive Logical Audit</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end px-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 italic">Audit Completion</span>
                        <span className="text-xs font-black italic text-primary">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 rounded-full bg-muted/40 overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                    </Progress>
                </div>
            </div>

            {error && (
                <div className="text-[11px] text-red-500 font-black uppercase tracking-widest bg-red-500/5 p-6 rounded-[30px] border border-red-500/20 animate-in slide-in-from-top-4 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {error}
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10 relative z-10">
                <TabsList className="bg-muted/20 p-2 rounded-[30px] h-16 border border-border/10 flex w-full backdrop-blur-sm">
                    {questions.slice(0, 3).map((_, i) => (
                        <TabsTrigger
                            key={i}
                            value={String(i)}
                            className="flex-1 rounded-[22px] text-[10px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-2xl transition-all duration-300"
                        >
                            <span className="mr-2 opacity-30 italic">0{i + 1}</span>
                            <span className="hidden sm:inline">{stepInfo[i]?.label || `Step ${i + 1}`}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {questions.slice(0, 3).map((q, i) => (
                    <TabsContent key={i} value={String(i)} className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full ${stepInfo[i]?.color} border border-current/10 shadow-sm`}>
                                    {stepInfo[i]?.icon}
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] italic">System Query</span>
                                </div>
                                <h3 className="text-xl font-black text-foreground tracking-tighter leading-tight italic border-l-4 border-primary/30 pl-8 group-hover/editor:border-primary transition-all duration-500">
                                    "{q}"
                                </h3>
                            </div>

                            <Textarea
                                value={answers[i]}
                                onChange={(e) => handleUpdate(i, e.target.value)}
                                placeholder="Discuss architectural trade-offs, scalability bottlenecks, or logical implementation patterns..."
                                className="w-full min-h-[250px] p-10 rounded-[45px] bg-background/50 backdrop-blur-md border-border/40 text-[15px] font-medium leading-relaxed focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all placeholder:text-muted-foreground/10 resize-none shadow-inner italic"
                            />
                        </div>
                    </TabsContent>
                ))}

                <div className="flex items-center gap-6 pt-6">
                    {activeTab !== "0" && (
                        <Button
                            variant="ghost"
                            onClick={() => setActiveTab(String(parseInt(activeTab) - 1))}
                            className="h-16 flex-1 rounded-[30px] font-black uppercase tracking-widest text-[10px] border border-border/40 hover:bg-muted/30 transition-all"
                        >
                            ← Back
                        </Button>
                    )}
                    {activeTab !== String(Math.min(questions.length, 3) - 1) ? (
                        <Button
                            onClick={() => setActiveTab(String(parseInt(activeTab) + 1))}
                            className="h-16 flex-[2] rounded-[30px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all bg-foreground text-background"
                        >
                            Next Dimension
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="h-16 flex-[2] rounded-[30px] bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.03] active:scale-[0.97] shadow-2xl shadow-primary/30 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>Synchronizing...</>
                            ) : (
                                <><Send className="w-5 h-5 mr-3" /> Commit Logic</>
                            )}
                        </Button>
                    )}
                </div>
            </Tabs>
        </div>
    );
}
