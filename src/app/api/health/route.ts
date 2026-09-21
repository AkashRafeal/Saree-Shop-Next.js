import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'UP',
    service: 'sareeaura-nextjs',
    timestamp: new Date().toISOString(),
  });
}
