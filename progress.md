# PVMforge — Progress Tracker

## Current Status
**Active Milestone**: M3
**Last Completed Step**: Step 3.1 — Wallet Auth
**Next Step**: Step 3.2
**Blockers**: None

---

## Completed Steps

### ✅ Step 0.1 — Research & Pin Critical Unknowns
**Date**: YYYY-MM-DD HH:MM
**Duration**: [actual]
**Blueprint Elements Covered**: Kitchensink image, RPC URL, ReviveApi method, resolc API
**Tests**: N/A (research)
**Issues**: [None / description + resolution]

### ✅ Step 0.2 — Initialize Project Stack
...

### ✅ Step 3.1 — Wallet Auth (`POST /api/v1/auth/wallet`)
**Date**: 2026-03-20 16:09 IST
**Duration**: ~60m
**Blueprint Elements Covered**: Signature verification via `viem.verifyMessage()`, exact sign message `"PVMforge session"`, JWT HS256 with `expiresIn: 86400`, httpOnly cookie storage (`pvmforge_session`)
**Tests**: `npx vitest run src/__tests__/api/auth-wallet.test.ts` (3 passed)
**Issues**:
- Prisma DB dependency in test environment caused failures; resolved by mocking `@/lib/db` user upsert in auth integration test.
- Cookie assertion case mismatch (`SameSite=lax` vs `Lax`) adjusted to framework output.
