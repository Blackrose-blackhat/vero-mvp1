'use server';

import { createSupabaseServerClient } from './supabaseServerClient';
import { revalidatePath } from 'next/cache';

export async function getUserRepos() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    // If we don't have a provider token, we can't fetch private repos or detailed info easily
    // But we can try to fetch public repos for the user's email/username if we have it
    // For now, let's assume the session has the token (typical for GitHub OAuth)
    console.warn('No provider token found in session. This might limit repository fetching.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    // Fetch from GitHub API using the provider token from session
    // Supabase auth-helpers store this token in the session object
    const response = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=50`, {
      headers: {
        Authorization: `Bearer ${session?.provider_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from GitHub');
    }

    const repos = await response.json();
    return { repos: repos.map((r: any) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      language: r.language,
      html_url: r.html_url,
      languages_url: r.languages_url
    })) };
  } catch (error: any) {
    return { error: error.message };
  }
}

async function getRepoFileContent(fullName: string, path: string, token?: string) {
  try {
    const response = await fetch(`https://api.github.com/repos/${fullName}/contents/${path}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/vnd.github.v3.raw',
      },
    });

    if (!response.ok) return null;
    return await response.text();
  } catch (e) {
    return null;
  }
}

async function checkPathExists(fullName: string, path: string, token?: string) {
  try {
    const response = await fetch(`https://api.github.com/repos/${fullName}/contents/${path}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}

export async function generateRepoQuestions(repoFullName: string, description: string, language: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.provider_token;

  // 1. Fetch File Structure to find actually interesting files
  let repoFiles: any[] = [];
  try {
    const structRes = await fetch(`https://api.github.com/repos/${repoFullName}/contents/`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    if (structRes.ok) repoFiles = await structRes.json();
  } catch (e) {}

  const interestingFiles = repoFiles
    .filter(f => f.type === 'file' && (f.name.match(/\.(ts|tsx|js|jsx|py|go|rs)$/) || f.name === 'package.json'))
    .sort((a, b) => b.size - a.size); // Biggest files usually have more logic

  // 2. Fetch Deep Code Context with language-aware manifest detection
  const manifestMap: Record<string, string[]> = {
    'TypeScript': ['package.json'],
    'JavaScript': ['package.json'],
    'Go': ['go.mod'],
    'Rust': ['Cargo.toml', 'Cargo.lock'],
    'Python': ['requirements.txt', 'pyproject.toml', 'setup.py'],
    'Java': ['pom.xml', 'build.gradle'],
  };

  const possibleManifests = manifestMap[language] || ['package.json', 'go.mod', 'Cargo.toml', 'requirements.txt'];
  
  // Find the first existing manifest from the list
  let manifestPath = 'package.json'; // Default
  for (const p of possibleManifests) {
    if (repoFiles.some(f => f.name === p)) {
      manifestPath = p;
      break;
    }
  }

  const [manifestContent, middleware, layout, readme, extraCode1, extraCode2] = await Promise.all([
    getRepoFileContent(repoFullName, manifestPath, token || undefined),
    getRepoFileContent(repoFullName, 'middleware.ts', token || undefined).then(res => res || getRepoFileContent(repoFullName, 'middleware.js', token || undefined)),
    getRepoFileContent(repoFullName, 'app/layout.tsx', token || undefined).then(res => res || getRepoFileContent(repoFullName, 'app/layout.js', token || undefined)),
    getRepoFileContent(repoFullName, 'README.md', token || undefined),
    // Fetch top 2 biggest source files that aren't the ones above
    getRepoFileContent(repoFullName, interestingFiles[0]?.name || '', token || undefined),
    getRepoFileContent(repoFullName, interestingFiles[1]?.name || '', token || undefined),
  ]);

  // Handle Missing API Key or AI Failure with Fallback Heuristics
  const grokApiKey = process.env.GROK_API_KEY;
  
  console.log('--- AI DIAGNOSTICS ---');
  console.log('GROK_API_KEY defined:', !!grokApiKey);
  if (grokApiKey) console.log('GROK_API_KEY prefix:', grokApiKey.substring(0, 7) + '...');
  
  if (!grokApiKey) {
    console.log('AI System: Missing GROK_API_KEY. Falling back to heuristics.');
    return { ...generateFallbackQuestions(repoFullName, description, manifestContent, !!middleware), isFallback: true };
  }

  try {
    const prompt = `
      You are a Senior Software Architect and Infrastructure Lead reviewing a GitHub repository.
      You are too ask questions but it should not be vague questions , ask more logical questions, 
      Ask about code logic , specific lines , system design questions.
      Repo Name: ${repoFullName}
      Description: ${description}
      Primary Language: ${language}

      CODE CONTEXT:
      ---
      Architectural Manifest (${manifestPath}):
      ${manifestContent || 'Not found'}
      ---
      Middleware/Routing logic:
      ${middleware || 'Not found'}
      ---
      Main Layout/Entry point:
      ${layout || 'Not found'}
      ---
      README snippet:
      ${readme?.substring(0, 500) || 'Not found'}
      ---
      Source Code Context 1:
      ${extraCode1?.substring(0, 1000) || 'None found'}
      ---
      Source Code Context 2:
      ${extraCode2?.substring(0, 1000) || 'None found'}
      ---

      TASK:
      Generate exactly 3 UNIQUE, deeply technical, and logically driven questions for the developer in the following SPECIFIC ORDER:
      1. Scalability: Focus on bottleneck handling, growth strategies, or cloud-native patterns.
      2. Tech Stack: Focus on implementation patterns, data flow, and technical trade-offs of their chosen tools.
      3. Security: Focus on auth logic, data protection, and vulnerability prevention.
      
      CRITICAL GUIDELINES:
      - NEVER ask a question that mentions a missing file (e.g., "Why is there no package.json?").
      - Only ask questions based on code that IS PRESENT in the context above.
      - If the language is ${language}, use terminology specific to that ecosystem.
      - Every question MUST reference a specific logic pattern found in the provided snippets.
 
      FORMAT: TOON
      Instructions for TOON format:
      1. Start with the string "TOON_START"
      2. List exactly 3 questions, each on a new line starting with "[Q]"
      3. End with the string "TOON_END"

      Example Output:
      TOON_START
      [Q] (Scalability) Your middleware handles X, but how do you prevent Y from scaling to Z users?
      [Q] (Tech Stack) Given your use of A, how do you manage cold-start latency in the B component?
      [Q] (Security) I noticed the C pattern in D; how do you prevent unauthorized access to E?
      TOON_END
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${grokApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a senior software architect. You strictly follow TOON format." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error('Groq API Error:', errorData);
        throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('--- RAW AI CONTENT ---');
    console.log(content);
    console.log('-----------------------');
    
    // Parse TOON format
    const lines = content.split('\n');
    const aiQuestions = lines
        .filter((l: string) => l.includes('[Q]'))
        .map((l: string) => l.split('[Q]')[1].trim());

    console.log('Parsed Questions Count:', aiQuestions.length);

    if (aiQuestions.length >= 3) {
      return { questions: aiQuestions.slice(0, 3), isFallback: false };
    }
    throw new Error('Invalid TOON response: Found ' + aiQuestions.length + ' questions.');

  } catch (error: any) {
    console.error('--- AI ERROR ---');
    console.error(error.message || error);
    return { ...generateFallbackQuestions(repoFullName, description, manifestContent, !!middleware), isFallback: true };
  }
}

function generateFallbackQuestions(repoFullName: string, description: string, packageJson: string | null, hasMiddleware: boolean) {
  const repoName = repoFullName.split('/')[1];
  const questions: string[] = [
    `How does the current architecture of ${repoName} handle increased load or data volume?`,
    `What specific trade-offs did you make when selecting the core tech stack for this project?`,
    `What security measures or data validation patterns are implemented in the ${repoName} codebase?`
  ];

  return { questions };
}

export async function createPostWithAnswers(postData: {
  repoName: string;
  repoUrl: string;
  questions: string[];
  answers: string[];
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Not authenticated' };

  // Insert post first
  const { data: post, error: postError } = await supabase.from('posts').insert({
    user_id: user.id,
    user_email: user.email,
    repo_name: postData.repoName,
    repo_url: postData.repoUrl,
    questions: postData.questions,
  }).select().single();

  if (postError) {
    console.error('Create Post Error:', postError);
    return { error: postError.message };
  }

  // Insert answers linked to the post
  const { error: answerError } = await supabase.from('answers').insert({
    post_id: post.id,
    answers: postData.answers,
  });

  if (answerError) {
    console.error('Create Answer Error:', answerError);
    return { error: answerError.message };
  }

  revalidatePath('/');
  return { success: true, postId: post.id };
}

export async function createPost(postData: {
  repoName: string;
  repoUrl: string;
  questions: string[];
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    user_email: user.email,
    repo_name: postData.repoName,
    repo_url: postData.repoUrl,
    questions: postData.questions,
  });

  if (error) {
    console.error('Create Post Error:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function createAnswer(postId: number, answers: string[]) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify owner
  const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single();
  if (post?.user_id !== user.id) return { error: 'Only the repository owner can answer these questions.' };

  // Use insert instead of upsert to enforce "write once"
  const { error } = await supabase.from('answers').insert({
    post_id: postId,
    answers: answers,
  });

  if (error) {
    if (error.code === '23505') { // Unique violation on post_id
      return { error: 'Answers have already been committed for this publication and cannot be modified.' };
    }
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/profile');
  return { success: true };
}

export async function addComment(postId: number, content: string, parentId?: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    user_email: user.email,
    content: content,
    parent_id: parentId,
  });

  if (error) return { error: error.message };
  revalidatePath('/');
  return { success: true };
}

export async function deletePost(postId: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  console.log(`[deletePost] LOG: Start cleanup for post ${postId} by user ${user.id}`);

  // 1. Verify ownership explicitly first
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  if (fetchError || !post) {
    console.error(`[deletePost] ERROR: Post not found or fetch error:`, fetchError);
    return { error: 'Post not found or unavailable.' };
  }

  if (post.user_id !== user.id) {
    console.warn(`[deletePost] WARN: User ${user.id} tried to delete post owned by ${post.user_id}`);
    return { error: 'Unauthorized: Ownership verification failed.' };
  }

  // 2. Delete child records
  console.log(`[deletePost] LOG: Deleting children...`);
  const childrenResults = await Promise.all([
    supabase.from('answers').delete().eq('post_id', postId).select(),
    supabase.from('reactions').delete().eq('post_id', postId).select(),
    supabase.from('comments').delete().eq('post_id', postId).select(),
  ]);

  childrenResults.forEach((res, i) => {
    const table = i === 0 ? 'answers' : i === 1 ? 'reactions' : 'comments';
    console.log(`[deletePost] LOG: Removed from ${table}:`, JSON.stringify(res.data));
    if (res.error) console.error(`[deletePost] ERROR: ${table} cleanup fail:`, res.error);
  });

  // 3. Delete the post itself
  console.log(`[deletePost] LOG: Executing final post delete...`);
  const { data: deletedData, error: deleteError } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .select();

  if (deleteError) {
    console.error(`[deletePost] ERROR: Final delete fail:`, deleteError);
    return { error: deleteError.message };
  }

  if (!deletedData || deletedData.length === 0) {
    console.error(`[deletePost] CRITICAL: Delete call returned success but 0 rows were affected. RLS likely blocking DELETE operation.`);
    return { error: 'Database rejected the deletion (RLS Policy restriction).' };
  }

  console.log(`[deletePost] SUCCESS: Post ${postId} permanently removed. Data:`, JSON.stringify(deletedData));
  
  revalidatePath('/');
  revalidatePath('/profile');
  return { success: true };
}

export async function toggleReaction(postId: number, reactionType: string = 'SKILL') {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Try to find existing reaction
  const { data: existing } = await supabase
    .from('reactions')
    .select('*')
    .match({ post_id: postId, user_id: user.id })
    .single();

  if (existing) {
    if (existing.type === reactionType) {
      // If clicking same type, remove it
      await supabase.from('reactions').delete().eq('id', existing.id);
    } else {
      // If clicking different type, update it
      await supabase.from('reactions').update({ type: reactionType }).eq('id', existing.id);
    }
  } else {
    await supabase.from('reactions').insert({
      post_id: postId,
      user_id: user.id,
      type: reactionType
    });
  }

  revalidatePath('/');
  revalidatePath('/profile');
  return { success: true };
}

export async function getPostInteractions(postId: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const [answersRes, commentsRes, reactionsRes] = await Promise.all([
    supabase.from('answers').select('*').eq('post_id', postId).single(),
    supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true }),
    supabase.from('reactions').select('*').eq('post_id', postId),
  ]);

  // Aggregate reactions by type
  const reactionsByType: Record<string, number> = {};
  reactionsRes.data?.forEach(r => {
    const type = r.type || 'SKILL';
    reactionsByType[type] = (reactionsByType[type] || 0) + 1;
  });

  const currentUserReaction = user ? reactionsRes.data?.find(r => r.user_id === user.id)?.type || null : null;

  return {
    answers: answersRes.data,
    comments: commentsRes.data || [],
    reactionsCount: reactionsRes.data?.length || 0,
    reactionsByType,
    currentUserReaction
  };
}

export async function getPublicFeed() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users (
        name,
        email,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch Feed Error:', error);
    return { error: error.message };
  }

  return { posts: data };
}

export async function searchUsers(query: string = '') {
  const supabase = await createSupabaseServerClient();
  
  let queryBuilder = supabase.from('users').select('*');

  if (query.trim()) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,email.ilike.%${query}%`);
  }

  const { data, error } = await queryBuilder
    .order('last_login', { ascending: false, nullsFirst: false })
    .limit(50);

  if (error) return { error: error.message };
  return { users: data || [] };
}

export async function getUserProfile(userId: string) {
  const supabase = await createSupabaseServerClient();

  const [userRes, postsRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  ]);

  if (userRes.error) return { error: userRes.error.message };
  
  return {
    user: userRes.data,
    posts: postsRes.data || []
  };
}
