import { beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { privateKeyToAccount } from 'viem/accounts';

import { POST } from '@/app/api/v1/auth/wallet/route';

const { mockUpsert } = vi.hoisted(() => ({
  mockUpsert: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      upsert: mockUpsert,
    },
  },
}));

const SIGN_MESSAGE = 'PVMforge session';
const TEST_SECRET = 'test-jwt-secret-wallet-auth';

const accountA = privateKeyToAccount(
  '0x59c6995e998f97a5a0044966f0945382d7f0d8f2f1af9e3f00f4fcd8f77d7f50'
);
const accountB = privateKeyToAccount('0x8b3a350cf5c34c9194ca3a545d6f6b6b46b5f6ef4b8b4c8d7e6b5d6d7c8f9a10');

describe('POST /api/v1/auth/wallet', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = TEST_SECRET;
    mockUpsert.mockResolvedValue({
      id: 'test-user-id',
      wallet_address: accountA.address.toLowerCase(),
    });
  });

  it('returns 400 when message is not the exact required string', async () => {
    const signature = await accountA.signMessage({ message: 'wrong-message' });

    const request = new NextRequest('http://localhost:3000/api/v1/auth/wallet', {
      method: 'POST',
      body: JSON.stringify({
        address: accountA.address,
        signature,
        message: 'wrong-message',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid message');
  });

  it('returns 401 when signature does not match provided address', async () => {
    const signatureFromDifferentAccount = await accountB.signMessage({ message: SIGN_MESSAGE });

    const request = new NextRequest('http://localhost:3000/api/v1/auth/wallet', {
      method: 'POST',
      body: JSON.stringify({
        address: accountA.address,
        signature: signatureFromDifferentAccount,
        message: SIGN_MESSAGE,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid signature');
  });

  it('verifies signature, returns HS256 token + expiry, and sets httpOnly session cookie', async () => {
    const signature = await accountA.signMessage({ message: SIGN_MESSAGE });

    const request = new NextRequest('http://localhost:3000/api/v1/auth/wallet', {
      method: 'POST',
      body: JSON.stringify({
        address: accountA.address,
        signature,
        message: SIGN_MESSAGE,
      }),
    });

    const response = await POST(request);
    const data = await response.json();
    const cookie = response.headers.get('set-cookie') ?? '';

    expect(response.status).toBe(200);
    expect(data.expiresIn).toBe(86400);
    expect(typeof data.token).toBe('string');

    const verified = jwt.verify(data.token, TEST_SECRET, { algorithms: ['HS256'] }) as {
      userId: string;
      address: string;
      iat: number;
      exp: number;
    };

    expect(verified.address).toBe(accountA.address.toLowerCase());
    expect(verified.userId).toBe('test-user-id');
    expect(verified.exp - verified.iat).toBe(86400);

    expect(cookie).toContain('pvmforge_session=');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Max-Age=86400');
    expect(cookie).toContain('SameSite=lax');

    expect(mockUpsert).toHaveBeenCalledWith({
      where: { wallet_address: accountA.address.toLowerCase() },
      update: { updated_at: expect.any(Date) },
      create: { wallet_address: accountA.address.toLowerCase() },
    });
  });
});
