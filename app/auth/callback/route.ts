import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import config from '@/config';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? config.auth.callbackUrl;

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
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );

  // Handle OAuth callback (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('Code exchange error:', error);
  }

  // Handle magic link / email OTP callback (token_hash)
  if (token_hash && type) {
    // EmailOtpType only supports: 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email'
    const emailOtpTypes = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'];
    if (emailOtpTypes.includes(type)) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email',
      });
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error('OTP verification error:', error);
    }
  }

  // If neither code nor token_hash, redirect to sign-in with error
  return NextResponse.redirect(`${origin}/sign-in?error=Could not authenticate user`);
}
