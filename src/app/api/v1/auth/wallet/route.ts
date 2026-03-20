import { verifyMessage } from 'viem';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

const SIGN_MESSAGE = 'PVMforge session';
const EXPIRES_IN_SECONDS = 86400;

type WalletAuthRequest = {
  address?: string;
  signature?: string;
  message?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WalletAuthRequest;
    const { address, signature, message } = body;

    if (!address || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: address, signature, message' },
        { status: 400 }
      );
    }

    if (message !== SIGN_MESSAGE) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const normalizedAddress = address.toLowerCase();

    const user = await db.user.upsert({
      where: { wallet_address: normalizedAddress },
      update: { updated_at: new Date() },
      create: { wallet_address: normalizedAddress },
    });

    const token = jwt.sign(
      { userId: user.id, address: normalizedAddress },
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: EXPIRES_IN_SECONDS,
      }
    );

    const response = NextResponse.json({ token, expiresIn: EXPIRES_IN_SECONDS });
    response.cookies.set('pvmforge_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: EXPIRES_IN_SECONDS,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

