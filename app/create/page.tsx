import { upsertUserAndLogLogin } from '../actions';
import { createSupabaseServerClient } from '../supabaseServerClient';
import RepoSelector from '../components/RepoSelector';
import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default async function CreatePage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    // Sync user data on the server
    await upsertUserAndLogLogin();

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[140px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[140px] rounded-full" />
            </div>

            <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 relative z-10">
                <header className="mb-16 space-y-4">

                    <div className="space-y-2">
                        <h2 className="text-4xl md:text-5xl font-black tracking-loose text-foreground uppercase italic decoration-primary/20 decoration-8 underline-offset-4 underline">
                            Create New Publication
                        </h2>
                        <p className="text-muted-foreground font-bold text-sm max-w-md leading-relaxed">
                            Select a repository from your stack to generate a deep-dive architectural review.
                        </p>
                    </div>
                </header>

                <div className="flex justify-center">
                    <RepoSelector />
                </div>
            </div>
        </div>
    );
}
