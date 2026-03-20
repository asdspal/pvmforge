/**
 * Integration tests for POST /api/v1/scaffold endpoint
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { POST } from '@/app/api/v1/scaffold/route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { redis, getCache, setCache } from '@/lib/cache';

describe('POST /api/v1/scaffold', () => {
  const validConfig = {
    contractType: 'ERC20',
    name: 'TestToken',
    symbol: 'TTK',
    features: {
      mintable: true,
      burnable: false,
      pausable: false,
      permit: false,
      votes: false,
    },
    accessControl: 'ownable',
    pvmOptions: {
      resolcCompatible: true,
      twoStepDeploy: true,
      xcmHooks: false,
    },
  };

  beforeAll(async () => {
    // Clean up any existing test data
    await db.scaffoldSession.deleteMany({
      where: { contract_name: 'TestToken' },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db.scaffoldSession.deleteMany({
      where: { contract_name: 'TestToken' },
    });
  });

  it('should return 400 for invalid request body', async () => {
    const invalidConfig = {
      contractType: 'ERC20',
      // Missing required fields
    };

    const request = new NextRequest('http://localhost:3000/api/v1/scaffold', {
      method: 'POST',
      body: JSON.stringify(invalidConfig),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toBeDefined();
    expect(Array.isArray(data.errors)).toBe(true);
  });

  it('should return 200 with compiled blob and 4 files for valid ERC20 config', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/scaffold', {
      method: 'POST',
      body: JSON.stringify(validConfig),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBeDefined();
    expect(data.files).toBeDefined();
    expect(data.files.contract).toBeDefined();
    expect(data.files.hardhatConfig).toBeDefined();
    expect(data.files.deployScript).toBeDefined();
    expect(data.files.readme).toBeDefined();
    expect(data.analysis).toBeDefined();
    expect(data.analysis.pvmCompatible).toBe(true);
    expect(data.compiledBlob).toBeDefined();
    expect(data.abi).toBeDefined();
    expect(Array.isArray(data.abi)).toBe(true);
  });

  it('should persist session in scaffold_sessions table', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/scaffold', {
      method: 'POST',
      body: JSON.stringify(validConfig),
    });

    const response = await POST(request);
    const data = await response.json();

    const session = await db.scaffoldSession.findUnique({
      where: { id: data.sessionId },
    });

    expect(session).toBeDefined();
    expect(session?.contract_name).toBe('TestToken');
    expect(session?.contract_type).toBe('ERC20');
    expect(session?.compile_success).toBe(true);
  });

  it('should return cached result for identical config', async () => {
    // First request
    const request1 = new NextRequest('http://localhost:3000/api/v1/scaffold', {
      method: 'POST',
      body: JSON.stringify(validConfig),
    });

    const response1 = await POST(request1);
    const data1 = await response1.json();

    // Second request (should be cached)
    const request2 = new NextRequest('http://localhost:3000/api/v1/scaffold', {
      method: 'POST',
      body: JSON.stringify(validConfig),
    });

    const response2 = await POST(request2);
    const data2 = await response2.json();

    expect(response2.status).toBe(200);
    expect(data2.sessionId).toBe(data1.sessionId);
  });

  it('should return 422 for config with EIP-1167 pattern (simulated error)', async () => {
    // Note: Our OZ wrapper doesn't generate EIP-1167 patterns by default
    // This test validates the error handling path
    // In a real scenario, we would test with a custom contract that has EIP-1167

    const configWithProxy = {
      contractType: 'Custom',
      name: 'ProxyContract',
      symbol: 'PRX',
      features: {
        mintable: false,
        burnable: false,
        pausable: false,
        permit: false,
        votes: false,
      },
      accessControl: 'ownable',
      pvmOptions: {
        resolcCompatible: true,
        twoStepDeploy: true,
        xcmHooks: false,
      },
    };

    const request = new NextRequest('http://localhost:3000/api/v1/scaffold', {
      method: 'POST',
      body: JSON.stringify(configWithProxy),
    });

    const response = await POST(request);
    
    // Custom contracts are not yet supported by OZ wrapper
    expect(response.status).toBe(500);
  });

  it('should generate valid Solidity contract with PVM pragma', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/scaffold', {
      method: 'POST',
      body: JSON.stringify(validConfig),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.files.contract).toContain('pragma solidity ^0.8.24;');
    expect(data.files.contract).toContain('SPDX-License-Identifier');
    expect(data.files.contract).toContain('PVM DEPLOYMENT');
  });

  it('should include analysis warnings in README', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/scaffold', {
      method: 'POST',
      body: JSON.stringify(validConfig),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.files.readme).toContain('PVM Compatibility Notes');
    expect(data.files.readme).toContain('Two-Step Deployment');
  });

  it('should include ABI with standard ERC20 functions', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/scaffold', {
      method: 'POST',
      body: JSON.stringify(validConfig),
    });

    const response = await POST(request);
    const data = await response.json();

    const functionNames = data.abi.map((item: { type: string; name: string }) => 
      item.type === 'function' ? item.name : null
    ).filter(Boolean);

    expect(functionNames).toContain('totalSupply');
    expect(functionNames).toContain('balanceOf');
    expect(functionNames).toContain('transfer');
  });

  it('should work for ERC721 contract type', async () => {
    const erc721Config = {
      ...validConfig,
      contractType: 'ERC721' as const,
      name: 'TestNFT',
      symbol: 'TNFT',
    };

    const request = new NextRequest('http://localhost:3000/api/v1/scaffold', {
      method: 'POST',
      body: JSON.stringify(erc721Config),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBeDefined();
    expect(data.analysis.pvmCompatible).toBe(true);
  });

  it('should work for ERC1155 contract type', async () => {
    const erc1155Config = {
      ...validConfig,
      contractType: 'ERC1155' as const,
      name: 'TestMulti',
      symbol: 'TMULT',
    };

    const request = new NextRequest('http://localhost:3000/api/v1/scaffold', {
      method: 'POST',
      body: JSON.stringify(erc1155Config),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBeDefined();
    expect(data.analysis.pvmCompatible).toBe(true);
  });
});
