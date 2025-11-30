import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import config from '@/config';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'email' | 'recovery' | 'invite' | 'magiclink' | 'signup' | 'email_change';
  const next = searchParams.get('next') ?? config.auth.callbackUrl;

  if (token_hash && type) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component context
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('Email confirmation error:', error);
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/sign-in?error=Could not confirm email`);
}
