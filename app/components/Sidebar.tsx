'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, User, Github, Search } from 'lucide-react';
import AuthButton from '../AuthButton';
import { Separator } from '@/components/ui/separator';

const sidebarLinks = [
    { name: 'Feed', href: '/', icon: Home },
    { name: 'Network', href: '/search', icon: Search },
    { name: 'Post', href: '/create', icon: PlusCircle },
    { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar({ user }: { user: any }) {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex-col border-r border-border/50 bg-background/60 backdrop-blur-xl p-6 hidden lg:flex z-50">
            <div className="flex items-center gap-3 mb-10 px-2 group cursor-pointer">
                <div className="bg-primary/10 p-2.5 rounded-[18px] group-hover:bg-primary/20 transition-all duration-300 shadow-inner">
                    <Github className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xl font-black tracking-tight text-foreground uppercase italic tracking-tighter decoration-primary decoration-4 underline-offset-4 hover:underline transition-all">Vero</span>
            </div>

            <nav className="flex-1 flex flex-col gap-1.5">
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                ? 'bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 scale-[1.02]'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`} />
                            <span className="tracking-tight">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 space-y-6">
                <div className="px-4 py-5 rounded-[24px] bg-gradient-to-br from-primary/10 via-transparent to-transparent border border-primary/10 mb-4 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-[9px] font-black uppercase text-primary tracking-[0.2em] mb-1 relative z-10">Status</p>
                    <p className="text-[11px] font-bold text-foreground/80 relative z-10 leading-tight">System Operational</p>
                </div>

                <Separator className="opacity-30" />
                <div className="flex flex-col gap-4">
                    {!user && (
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] px-4 mb-1">Global Network</p>
                    )}
                    <AuthButton user={user} />
                </div>
            </div>
        </aside>
    );
}
