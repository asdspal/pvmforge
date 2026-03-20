/**
 * GET /api/v1/profile/:sessionId
 *
 * Retrieve profiling results for a specific session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateEfficiency } from '@/lib/profiler/utils';

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

    // Fetch the profiler session
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

    // Determine status based on whether results exist
    const hasResults = session.weight_results.length > 0;
    const status = hasResults ? 'complete' : 'pending';

    // Transform results to match blueprint response format
    const results = session.weight_results.map((wr: any) => ({
      functionName: wr.function_name,
      functionSignature: wr.function_signature,
      pvm: {
        refTime: wr.ref_time ? Number(wr.ref_time) : 0,
        proofSize: wr.proof_size ? Number(wr.proof_size) : 0,
        storageDeposit: wr.storage_deposit ? Number(wr.storage_deposit) : 0,
      },
      evmGasEstimate: wr.evm_gas_estimate ? Number(wr.evm_gas_estimate) : 0,
      normalizedComparison: {
        pvmEfficiency: calculateEfficiency(wr.ref_time, wr.evm_gas_estimate),
      },
    }));

    return NextResponse.json({
      sessionId: session.id,
      contractAddress: session.contract_address,
      network: session.network,
      status,
      results,
    });
  } catch (error) {
    console.error('Profile GET API error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}
