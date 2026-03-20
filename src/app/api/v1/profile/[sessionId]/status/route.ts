/**
 * GET /api/v1/profile/:sessionId/status
 *
 * Poll job status for a profiling session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    // Validate sessionId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return NextResponse.json(
        { errors: [{ message: 'Invalid sessionId format' }] },
        { status: 400 }
      );
    }

    // Fetch the profiler session with weight results
    const session = await db.profilerSession.findUnique({
      where: { id: sessionId },
      include: {
        weight_results: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { errors: [{ message: 'Session not found' }] },
        { status: 404 }
      );
    }

    // Determine status and progress
    const hasResults = session.weight_results.length > 0;
    const status = hasResults ? 'complete' : 'pending';
    
    // For MVP, we assume all functions are profiled at once
    // Progress is either 0% or 100%
    const progress = hasResults ? 100 : 0;
    
    // Generate appropriate message
    const message = hasResults
      ? 'Profiling complete'
      : 'Profiling in progress...';

    return NextResponse.json({
      sessionId: session.id,
      status,
      progress,
      message,
    });
  } catch (error) {
    console.error('Profile status API error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}
