export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// Request Supabase health endpoint to keep it active
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Supabase returned status: ${response.status}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cron job ping failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
