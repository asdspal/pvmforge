/**
 * API route to test resolc WASM compilation
 * POST /api/compile-test
 */

import { NextRequest, NextResponse } from 'next/server';
import { testCompile } from '@/lib/compiler/resolc';

// Set max duration for Vercel serverless functions (60 seconds)
export const maxDuration = 60;

export async function POST() {
  try {
    const result = await testCompile();
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        hasBytecode: false,
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Also support GET for quick testing
export async function GET() {
  return POST();
}
