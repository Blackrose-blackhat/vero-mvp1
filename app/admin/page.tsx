import Link from 'next/link';
import { getLoginInsights } from '../insights';
import { createSupabaseServerClient } from '../supabaseServerClient';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Basic protection: Only allow certain email or logged in status
    // In production, use a proper 'roles' table or env variable
    if (!user) {
        redirect('/');
    }

    const insights = await getLoginInsights();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 dark:bg-black font-sans">
            <div className="w-full max-w-3xl rounded-3xl bg-white p-12 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900">
                <Link href="/" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white mb-8 block">
                    ← Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-black dark:text-white">Admin Insights</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">Private statistics for your application.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
                    <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Today's Logins</p>
                        <p className="text-4xl font-bold text-black dark:text-white mt-2">
                            {insights.error ? '—' : insights.todayLogins}
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Unique Visitors Today</p>
                        <p className="text-4xl font-bold text-black dark:text-white mt-2">
                            {insights.error ? '—' : insights.uniqueVisitors}
                        </p>
                    </div>
                </div>

                {insights.error && (
                    <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 dark:bg-red-950 dark:border-red-900 dark:text-red-400">
                        Error loading insights: {insights.error}
                    </div>
                )}
            </div>
        </div>
    );
}
