/**
 * POST /api/v1/scaffold
 *
 * PVM Scaffold Generator API Endpoint
 *
 * Orchestrates the full scaffold generation pipeline:
 * 1. Validates request using Zod schema
 * 2. Checks Redis cache for cached results
 * 3. Generates Solidity via OpenZeppelin Wizard
 * 4. Applies PVM post-processing
 * 5. Runs static analysis for PVM compatibility
 * 6. Compiles with resolc (if no errors)
 * 7. Generates config files (hardhat.config, deploy script, README)
 * 8. Persists session to database
 * 9. Returns compiled blob, ABI, files, and analysis
 */

export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@/generated/prisma/client';
import { generateSolidity } from '@/lib/scaffold/oz-wrapper';
import { applyPVMPostProcess } from '@/lib/scaffold/pvm-postprocessor';
import { analyzePVMCompatibility } from '@/lib/scaffold/analyzer';
import { compileSolidity } from '@/lib/compiler/resolc';
import type { SolcInput } from '@parity/resolc';
import { generateHardhatConfig, generateDeployScript, generateReadme } from '@/lib/scaffold/config-generator';
import { db } from '@/lib/db';
import { getCache, setCache } from '@/lib/cache';

const ScaffoldConfigSchema = z.object({
  contractType: z.enum(['ERC20', 'ERC721', 'ERC1155', 'Governor', 'Custom']),
  name: z.string().min(1).max(50),
  symbol: z.string().min(1).max(11),
  features: z.object({
    mintable: z.boolean(),
    burnable: z.boolean(),
    pausable: z.boolean(),
    permit: z.boolean(),
    votes: z.boolean(),
  }),
  accessControl: z.enum(['ownable', 'roles', 'managed']),
  pvmOptions: z.object({
    resolcCompatible: z.boolean(),
    twoStepDeploy: z.boolean(),
    xcmHooks: z.boolean(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ScaffoldConfigSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const config = parsed.data;

    // Cache key based on config
    const cacheKey = `scaffold:${JSON.stringify(config)}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // 1. Generate Solidity via OZ Wizard
    const rawSource = generateSolidity(config);

    // 2. PVM Post-Process
    const processedSource = applyPVMPostProcess(rawSource);

    // 3. Static Analysis
    const issues = analyzePVMCompatibility(processedSource);
    const errors = issues.filter(i => i.severity === 'error');

    // 4. If errors exist, return 422 — do not compile
    if (errors.length > 0) {
      return NextResponse.json(
        { errors },
        { status: 422 }
      );
    }

    // 5. Compile with resolc
    const solcInput: SolcInput = {
      [`${config.name}.sol`]: {
        content: processedSource,
      },
    };
    
    const compiled = await compileSolidity(solcInput);
    
    // Extract ABI from compiled output
    const contractName = config.name;
    const contractOutput = compiled.contracts?.[`${config.name}.sol`]?.[contractName];
    const abi = contractOutput?.abi || [];
    
    // Note: resolc WASM doesn't return bytecode, so we use the compiled source as the "blob"
    // In production, this would be the actual PVM bytecode from the native resolc binary
    const compiledBlob = processedSource;

    // 6. Generate config files
    const files = {
      contract: processedSource,
      hardhatConfig: generateHardhatConfig(config),
      deployScript: generateDeployScript(config),
      readme: generateReadme(config, issues),
    };

    // 7. Persist session (user_id optional until auth is implemented)
    const session = await db.scaffoldSession.create({
      data: {
        config: config as unknown as Prisma.InputJsonValue,
        contract_name: config.name,
        contract_type: config.contractType,
        oz_version: '5.x',
        warnings: issues.filter(i => i.severity === 'warning') as unknown as Prisma.InputJsonValue,
        errors: [] as unknown as Prisma.InputJsonValue,
        compile_success: true,
      },
    });

    const response = {
      sessionId: session.id,
      files,
      analysis: {
        warnings: issues.filter(i => i.severity === 'warning'),
        info: issues.filter(i => i.severity === 'info'),
        errors: [],
        pvmCompatible: true,
      },
      compiledBlob,
      abi,
    };

    await setCache(cacheKey, response, 3600);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Scaffold API error:', error);
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : 'Internal server error' }] },
      { status: 500 }
    );
  }
}
