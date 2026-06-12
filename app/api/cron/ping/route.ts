export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// Ping để giữ dự án Supabase hoạt động.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env variables');
    return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 });
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/family_trees?select=id&limit=1`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cron job ping failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
