import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    framework: 'Next.js 16 (App Router)',
    server: 'Next.js Node Server',
    timestamp: new Date().toISOString(),
  });
}
