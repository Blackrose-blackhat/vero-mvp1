'use server';

import PostCard from '@/app/components/PostCard';
import { getPostInteractions } from '@/app/repo_actions';
import { createSupabaseServerClient } from '@/app/supabaseServerClient';

export default async function PostCardServer({ post }: { post: any }) {
    const supabase = await createSupabaseServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const interactions = await getPostInteractions(post.id);
    return <PostCard post={post} currentUser={currentUser} interactions={interactions} />;
}
