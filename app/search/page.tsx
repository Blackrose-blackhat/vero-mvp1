'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, User, Mail, ArrowRight, Loader2, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { searchUsers } from '@/app/repo_actions';
import { useAuth } from '@/app/components/AuthProvider';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const res = await searchUsers(query);
            if ('users' in res && res.users) {
                const filtered = currentUser ? res.users.filter((u) => u.id !== currentUser.id) : res.users;
                setUsers(filtered);
            }
            setLoading(false);
        };

        const delayDebounceFn = setTimeout(fetchUsers, query ? 300 : 0);
        return () => clearTimeout(delayDebounceFn);
    }, [query, currentUser]);

    return (
        <div className="min-h-screen bg-background p-6 sm:p-10 lg:p-20">
            <div className="max-w-4xl mx-auto space-y-12">
                <header className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase italic underline decoration-primary/20 decoration-8 underline-offset-8">
                        Architectural Network
                    </h1>
                    <p className="text-muted-foreground font-bold text-sm max-w-md uppercase tracking-widest opacity-60">
                        The definitive directory of logical engineers and system architects.
                    </p>
                </header>

                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-[32px] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                        <Input
                            type="text"
                            placeholder="Search by name, email, or architectural specialty..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-16 pl-16 pr-8 rounded-[30px] bg-card/60 backdrop-blur-xl border-border/40 text-lg font-medium focus:ring-4 focus:ring-primary/5 transition-all outline-none italic"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Scanning Nodes...</p>
                        </div>
                    ) : users.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {users.map((user, i) => (
                                <Link key={user.id} href={`/profile/${user.id}`}>
                                    <Card className="rounded-[35px] border-border/40 bg-card/40 hover:bg-card/60 hover:border-primary/20 transition-all duration-500 group overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <CardContent className="p-6 flex items-center gap-5 relative z-10">
                                            <Avatar className="w-16 h-16 border-2 border-background shadow-lg group-hover:scale-105 transition-transform duration-500">
                                                <AvatarImage src={user.avatar_url} />
                                                <AvatarFallback className="font-black bg-primary/5 text-primary italic">
                                                    {(user.name || user.email)?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <h3 className="font-black text-foreground uppercase italic tracking-tight truncate group-hover:text-primary transition-colors">
                                                    {user.name || 'Architect'}
                                                </h3>
                                                <p className="text-[11px] font-bold text-muted-foreground/60 truncate flex items-center gap-1.5 lowercase">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/5 rounded-[40px] border border-dashed border-border/40">
                            <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest italic">No architectural nodes discovered in this sector.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
