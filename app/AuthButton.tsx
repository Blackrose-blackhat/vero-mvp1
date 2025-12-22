'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createSupabaseClient } from './supabaseClient';
import { signOut } from './actions';
import { useRouter } from 'next/navigation';
import { Github, LogOut, User } from 'lucide-react';

export default function AuthButton({ user }: { user: any }) {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const signInWithGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  if (!user) {
    return (
      <Button
        onClick={signInWithGitHub}
        className="w-full h-12 rounded-2xl font-black uppercase tracking-widest shadow-xl"
      >
        <Github className="w-5 h-5 mr-2" />
        Log In
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full px-2">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 border border-border">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback>
            <User className="w-5 h-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-foreground truncate">
            {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </span>
          <span className="text-[10px] text-muted-foreground truncate tracking-tighter">{user.email}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="justify-start p-3 text-[10px] font-black uppercase text-muted-foreground hover:text-destructive tracking-widest h-auto"
      >
        <LogOut className="w-3 h-3 mr-2" />
        Logout
      </Button>
    </div>
  );
}
