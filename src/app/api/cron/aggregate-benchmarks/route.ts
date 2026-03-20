import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type ProfilerSessionRow = {
  id: string;
  abi: unknown;
};

type AggregateRow = {
  session_id: string;
  function_name: string;
  avg_ref_time: bigint | number | null;
  avg_proof_size: bigint | number | null;
  avg_evm_gas: bigint | number | null;
  sample_count: number;
};

type BenchmarkAggregate = {
  contractType: string;
  functionName: string;
  avgRefTime: number | null;
  avgProofSize: number | null;
  avgEvmGas: number | null;
  sampleCount: number;
};

function toNumber(value: bigint | number | null): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'bigint' ? Number(value) : value;
}

function inferContractTypeFromAbi(abi: unknown): string {
  if (!Array.isArray(abi)) return 'Custom';

  const functionNames = new Set(
    abi
      .filter((entry) => typeof entry === 'object' && entry !== null)
      .filter((entry) => (entry as { type?: string }).type === 'function')
      .map((entry) => (entry as { name?: string }).name)
      .filter((name): name is string => typeof name === 'string')
  );

  const has = (name: string) => functionNames.has(name);

  if (has('safeBatchTransferFrom') || has('balanceOfBatch')) return 'ERC1155';
  if (has('ownerOf') || has('tokenURI')) return 'ERC721';
  if (has('totalSupply') && has('balanceOf') && has('transfer') && has('approve')) return 'ERC20';
  if (has('propose') || has('castVote')) return 'Governor';

  return 'Custom';
}

/**
 * GET /api/cron/aggregate-benchmarks
 * Nightly Vercel cron aggregation for public benchmark dataset.
 */
export async function GET(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const sessions = await db.$queryRaw<ProfilerSessionRow[]>`
      SELECT id, abi
      FROM profiler_sessions
    `;

    const sessionContractType = new Map<string, string>();
    for (const session of sessions) {
      sessionContractType.set(session.id, inferContractTypeFromAbi(session.abi));
    }

    const aggregateRows = await db.$queryRaw<AggregateRow[]>`
      SELECT
        session_id,
        function_name,
        AVG(ref_time)::BIGINT AS avg_ref_time,
        AVG(proof_size)::BIGINT AS avg_proof_size,
        AVG(evm_gas_estimate)::BIGINT AS avg_evm_gas,
        COUNT(*)::INT AS sample_count
      FROM weight_results
      GROUP BY session_id, function_name
    `;

    const merged = new Map<string, BenchmarkAggregate>();

    for (const row of aggregateRows) {
      const contractType = sessionContractType.get(row.session_id) ?? 'Custom';
      const key = `${contractType}::${row.function_name}`;

      const existing = merged.get(key);
      if (!existing) {
        merged.set(key, {
          contractType,
          functionName: row.function_name,
          avgRefTime: toNumber(row.avg_ref_time),
          avgProofSize: toNumber(row.avg_proof_size),
          avgEvmGas: toNumber(row.avg_evm_gas),
          sampleCount: row.sample_count,
        });
        continue;
      }

      const totalSamples = existing.sampleCount + row.sample_count;

      const weightedAvg = (
        prevAvg: number | null,
        prevSamples: number,
        nextAvg: number | null,
        nextSamples: number
      ): number | null => {
        if (prevAvg === null && nextAvg === null) return null;
        if (prevAvg === null) return nextAvg;
        if (nextAvg === null) return prevAvg;
        return Math.round((prevAvg * prevSamples + nextAvg * nextSamples) / (prevSamples + nextSamples));
      };

      merged.set(key, {
        contractType,
        functionName: row.function_name,
        avgRefTime: weightedAvg(existing.avgRefTime, existing.sampleCount, toNumber(row.avg_ref_time), row.sample_count),
        avgProofSize: weightedAvg(existing.avgProofSize, existing.sampleCount, toNumber(row.avg_proof_size), row.sample_count),
        avgEvmGas: weightedAvg(existing.avgEvmGas, existing.sampleCount, toNumber(row.avg_evm_gas), row.sample_count),
        sampleCount: totalSamples,
      });
    }

    const aggregates = Array.from(merged.values());

    await db.$transaction(async (tx) => {
      await tx.$executeRaw`TRUNCATE TABLE public_benchmarks`;

      for (const row of aggregates) {
        await tx.$executeRaw`
          INSERT INTO public_benchmarks (
            contract_type,
            function_name,
            avg_ref_time,
            avg_proof_size,
            avg_evm_gas,
            sample_count,
            last_updated
          ) VALUES (
            ${row.contractType},
            ${row.functionName},
            ${row.avgRefTime},
            ${row.avgProofSize},
            ${row.avgEvmGas},
            ${row.sampleCount},
            NOW()
          )
        `;
      }
    });

    return NextResponse.json({
      ok: true,
      aggregatedRows: aggregates.length,
    });
  } catch (error) {
    console.error('Benchmark aggregation cron failed:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}

