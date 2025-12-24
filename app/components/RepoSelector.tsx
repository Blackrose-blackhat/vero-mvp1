'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { generateRepoQuestions, createPostWithAnswers } from '../repo_actions';
import { Send, CheckCircle2, ChevronRight, ArrowLeft, Loader2, Code2, Sparkles, Terminal, Shield, Zap, Search } from 'lucide-react';

export default function RepoSelector({ initialRepos }: { initialRepos: any[] }) {
    const router = useRouter();
    const [repos, setRepos] = useState<any[]>(initialRepos);



    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'select' | 'answer'>('select');
    const [selectedRepo, setSelectedRepo] = useState<any>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const [isFallback, setIsFallback] = useState(false);
    const [answers, setAnswers] = useState<string[]>(['', '', '']);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState("0");

    // Repos loaded via props
    // useEffect for loadRepos removed

    const handleSelectRepo = async (repo: any) => {
        setSelectedRepo(repo);
        setError(null);
        setLoading(true);
        const res = await generateRepoQuestions(repo.full_name, repo.description, repo.language);
        setQuestions(res.questions);
        setIsFallback(!!res.isFallback);
        setAnswers(['', '', '']);
        setActiveTab("0");
        setLoading(false);
        setStep('answer');
    };

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handlePost = async () => {
        const displayedQuestionCount = Math.min(questions.length, 3);
        const answersToVerify = answers.slice(0, displayedQuestionCount);

        if (answersToVerify.some(a => !a.trim())) {
            setError('Please complete the architectural review for all visible categories.');
            return;
        }

        setPosting(true);
        const res = await createPostWithAnswers({
            repoName: selectedRepo.name,
            repoUrl: selectedRepo.html_url,
            questions: questions.slice(0, displayedQuestionCount),
            answers: answersToVerify
        });
        if (res.error) {
            setError(res.error);
        } else {
            setSuccess(true);
        }
        setPosting(false);
    };

    const displayedQuestionCount = Math.min(questions.length, 3);
    const progress = displayedQuestionCount > 0
        ? (answers.slice(0, displayedQuestionCount).filter(a => a.trim()).length / displayedQuestionCount) * 100
        : 0;

    const stepInfo = [
        { icon: <Zap className="w-4 h-4" />, label: "Scalability", color: "bg-amber-500/10 text-amber-600" },
        { icon: <Code2 className="w-4 h-4" />, label: "Tech Stack", color: "bg-primary/10 text-primary" },
        { icon: <Shield className="w-4 h-4" />, label: "Security", color: "bg-blue-500/10 text-blue-600" },
    ];

    if (success) {
        return (
            <Card className="w-full max-w-2xl rounded-[60px] p-20 border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-10 animate-in zoom-in duration-700 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-inner relative z-10 animate-bounce">
                    <CheckCircle2 className="w-14 h-14" />
                </div>
                <div className="space-y-4 relative z-10">
                    <h2 className="text-4xl font-black tracking-tight text-foreground uppercase italic underline decoration-primary decoration-8 underline-offset-8">Insight Committed</h2>
                    <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] opacity-60">Your professional analysis is now live on the global network.</p>
                </div>
                <Button
                    size="lg"
                    onClick={() => router.push('/')}
                    className="rounded-full px-16 h-16 font-black uppercase tracking-widest shadow-2xl hover:scale-[1.05] active:scale-95 transition-all text-[11px] relative z-10"
                >
                    Return to Feed
                </Button>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-3xl rounded-[60px] border-border/40 bg-card/40 backdrop-blur-3xl shadow-2xl overflow-hidden transition-all duration-700">
            <CardHeader className="px-14 py-5 pb-0 flex flex-row items-center justify-between relative z-10 group">
                <div className="absolute inset-0 t  transition-opacity duration-700 pointer-events-none" />

                {step === 'answer' ? (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep('select')}
                            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground h-10 px-6 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all border border-border/20 relative z-20"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Restart
                        </Button>
                        <div className="flex flex-col gap-1.5 min-w-0 relative z-20 text-right">
                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic">Active Stack</span>
                            <h3 className="text-lg font-black text-foreground truncate italic leading-tight">
                                {selectedRepo?.name}
                            </h3>
                        </div>
                    </>
                ) : (
                    <div className="space-y-2 relative z-20">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">
                                Select Stack
                            </h2>
                        </div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] opacity-50">
                            Initialization of repository handshake
                        </p>
                    </div>
                )}
            </CardHeader>

            <CardContent className="px-14 py-5 pt-10">
                {error && (
                    <div className="mb-10 p-8 bg-destructive/10 text-destructive rounded-[35px] text-[11px] border border-destructive/20 font-black uppercase tracking-widest animate-in slide-in-from-top-4 flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-destructive animate-ping" />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-10">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
                            <Loader2 className="w-20 h-20 text-primary animate-spin-slow opacity-20 relative z-10" />
                            <Sparkles className="w-10 h-10 text-primary absolute inset-0 m-auto animate-pulse relative z-10" />
                        </div>
                        <div className="text-center space-y-4">
                            <h3 className="text-sm font-black text-foreground uppercase tracking-[0.3em] italic">Neural Analysis Active</h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest max-w-[300px] leading-relaxed opacity-60">Scanning codebase patterns, dependency structures & architectural trade-offs via Groq 70B...</p>
                        </div>
                    </div>
                ) : step === 'select' ? (
                    <div className="space-y-6 animate-in fade-in duration-700">
                        <div className="relative group">
                            <div className="absolute -inset-1 rounded-[42px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <ScrollArea className="h-[450px] pr-8 relative">
                                <div className="grid grid-cols-1 gap-4">
                                    {repos.length === 0 ? (
                                        <div className="text-center py-24 bg-muted/10 rounded-[40px] border border-dashed border-border/40 flex flex-col items-center gap-6">
                                            <Search className="w-16 h-16 text-muted-foreground/10" />
                                            <p className="text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic">Zero repositories detected in namespace.</p>
                                        </div>
                                    ) : (
                                        repos.map((repo, i) => (
                                            <Button
                                                key={repo.id}
                                                variant="ghost"
                                                onClick={() => handleSelectRepo(repo)}
                                                className="group h-28 flex items-center justify-between p-8 rounded-[35px] border border-border/20  hover:border-primary/40 transition-all duration-500 text-left animate-in slide-in-from-bottom-4"

                                            >
                                                <div className="flex items-center gap-6 min-w-0">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                                                        <Code2 className="w-5 h-5 text-primary/60 group-hover:text-primary group-hover:scale-110 transition-all" />
                                                    </div>
                                                    <div className="flex flex-col gap-1 min-w-0">
                                                        <span className="text-[15px] font-black text-foreground group-hover:text-primary transition-colors truncate italic">
                                                            {repo.name}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.15em] p-1 px-2.5 h-[18px] rounded-full border-muted-foreground/20 leading-none bg-muted/10">
                                                                {repo.language || 'Protocol'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-2 transition-all duration-500" />
                                            </Button>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">


                        <div className="space-y-3 relative z-10">
                            <div className="flex justify-between items-end px-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 italic">Validation Sequence</span>
                                <span className="text-xs font-black italic text-primary">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2 rounded-full bg-muted/20" />
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10 relative z-10">
                            <TabsList className="bg-muted/10 p-1.5 rounded-[32px] h-16 border border-border/10 flex w-full backdrop-blur-md">
                                {questions.slice(0, 3).map((_, i) => (
                                    <TabsTrigger
                                        key={i}
                                        value={String(i)}
                                        className="flex-1 rounded-[25px] text-[10px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-2xl transition-all duration-500"
                                    >
                                        <span className="mr-2 opacity-30 italic">0{i + 1}</span>
                                        <span className="hidden sm:inline">{stepInfo[i]?.label || `Step ${i + 1}`}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {questions.slice(0, 3).map((q, i) => (
                                <TabsContent key={i} value={String(i)} className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div className="space-y-10">
                                        <div className="space-y-5">
                                            <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full ${stepInfo[i]?.color || 'bg-muted/20 text-muted-foreground'} border border-current/10 shadow-sm`}>
                                                {stepInfo[i]?.icon || <Terminal className="w-4 h-4" />}

                                            </div>
                                            <h3 className="text-lg  text-foreground  leading-tight italic border-l-4 border-primary/30 pl-10 transition-all duration-500">
                                                "{q}"
                                            </h3>
                                        </div>

                                        <Textarea
                                            value={answers[i]}
                                            onChange={(e) => handleAnswerChange(i, e.target.value)}
                                            placeholder="Walk us through your architectural trade-offs, scalability patterns, and security decisions..."
                                            className="min-h-[220px] rounded-[45px] bg-background/50 border-border/40 p-10 text-[15px] focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-inner transition-all resize-none italic font-medium leading-relaxed"
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
                                        ← Previous
                                    </Button>
                                )}
                                {activeTab !== String(Math.max(0, displayedQuestionCount - 1)) ? (
                                    <Button
                                        onClick={() => setActiveTab(String(parseInt(activeTab) + 1))}
                                        className="h-16 flex-[2] rounded-[30px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all bg-foreground text-background"
                                    >
                                        Next Dimension
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handlePost}
                                        disabled={posting || displayedQuestionCount === 0}
                                        className="h-16 flex-[2] rounded-[30px] bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.03] active:scale-[0.97] shadow-2xl shadow-primary/30 transition-all disabled:opacity-50"
                                    >
                                        {posting ? (
                                            <>Transmitting Review...</>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-3" />
                                                Finalize Publication
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </Tabs>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
