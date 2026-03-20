import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type BenchmarkRow = {
  contract_type: string;
  function_name: string;
  avg_ref_time: bigint | number | null;
  avg_proof_size: bigint | number | null;
  avg_evm_gas: bigint | number | null;
  sample_count: number;
};

function toNumber(value: bigint | number | null): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'bigint' ? Number(value) : value;
}

/**
 * GET /api/v1/benchmarks?contractType=ERC20
 * Public aggregated benchmark data.
 */
export async function GET(req: NextRequest) {
  try {
    const contractType = req.nextUrl.searchParams.get('contractType');

    const rows = await db.$queryRaw<BenchmarkRow[]>`
      SELECT
        contract_type,
        function_name,
        avg_ref_time,
        avg_proof_size,
        avg_evm_gas,
        sample_count
      FROM public_benchmarks
      WHERE ${contractType}::text IS NULL OR contract_type = ${contractType}
      ORDER BY contract_type ASC, function_name ASC
    `;

    return NextResponse.json({
      contractType: contractType ?? 'ALL',
      benchmarks: rows.map((row) => ({
        contractType: row.contract_type,
        functionName: row.function_name,
        avgRefTime: toNumber(row.avg_ref_time),
        avgProofSize: toNumber(row.avg_proof_size),
        avgEvmGas: toNumber(row.avg_evm_gas),
        sampleCount: row.sample_count,
      })),
    });
  } catch (error) {
    console.error('Benchmarks GET API error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}

