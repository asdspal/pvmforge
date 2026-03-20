# PVMforge

PVMforge is a developer workbench for Polkadot Hub PolkaVM (PVM), built for the Polkadot Solidity Hackathon. It helps Solidity developers:

1. Generate OpenZeppelin-based contracts with PVM-aware scaffolding.
2. Profile deployed contracts with decomposed PVM weight metrics (`ref_time`, `proof_size`, `storage_deposit`) and EVM comparison data.

This README is aligned to the project blueprint in [`memory-bank/blueprint.md`](memory-bank/blueprint.md).

## What this project includes

- **Scaffold Generator** (`/scaffold`)
  - OpenZeppelin contract generation flow
  - PVM post-processing and analyzer warnings
  - Generated outputs for contract/config/deploy/readme flows
- **Weight Profiler** (`/profiler`, `/profiler/[sessionId]`)
  - Contract profiling sessions
  - Weight result persistence
  - Chart/table visualization of profiling output
- **Wallet Auth + Benchmarks APIs**
  - Wallet signature verification flow
  - Public benchmark endpoints and aggregation utilities

## Tech stack

- **Framework**: Next.js App Router + TypeScript
- **UI**: Tailwind CSS
- **Database**: PostgreSQL + Prisma
- **Caching / infra support**: Redis-compatible URL support
- **Testing**: Vitest
- **Core domains**:
  - Scaffold domain in [`src/lib/scaffold`](src/lib/scaffold)
  - Profiler domain in [`src/lib/profiler`](src/lib/profiler)
  - API routes in [`src/app/api/v1`](src/app/api/v1)

## Project structure

```text
src/
  app/
    api/v1/                 # API endpoints (auth, scaffold, profiler, benchmarks)
    scaffold/               # Scaffold page
    profiler/               # Profiler pages
    docs/                   # Documentation page
  components/
    scaffold/               # Scaffold UI components
    profiler/               # Profiler UI components
  lib/
    scaffold/               # Scaffold generators/analyzers/post-processors
    profiler/               # Weight profiling engine
    rpc/                    # RPC clients
    db.ts                   # Prisma client wiring
prisma/
  schema.prisma             # Database schema
  migrations/               # Prisma migrations
```

## Prerequisites

- Node.js 22+ recommended
- npm
- PostgreSQL (local or hosted)
- Optional: Redis instance for caching-related flows

## Environment variables

Create [`.env.local`](.env.local) with values for your environment:

```env
POLKADOT_HUB_TESTNET_RPC=https://testnet-rpc.polkadot-hub.io
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<your-key>
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
REDIS_URL=redis://<host>:<port>
JWT_SECRET=<long-random-secret>
```

If your deployment/runtime uses additional secrets, keep them consistent with API route expectations in [`src/app/api/v1`](src/app/api/v1).

## Local development

Install dependencies:

```bash
npm install
```

Generate Prisma client and apply migrations:

```bash
npx prisma migrate dev
```

Start development server:

```bash
npm run dev
```

Open the app at `http://localhost:3000`.

## Available scripts

- `npm run dev` — run local development server
- `npm run build` — build production assets
- `npm run start` — run production server
- `npm run lint` — run lint checks
- `npm run test` — run tests

## API surface (v1)

Implemented API routes are under [`src/app/api/v1`](src/app/api/v1):

- `POST /api/v1/auth/wallet`
- `GET /api/v1/benchmarks`
- `POST /api/v1/scaffold`
- `POST /api/v1/profile`
- `GET /api/v1/profile/[sessionId]`
- `GET /api/v1/profile/[sessionId]/status`

Additionally, project utilities include:

- `POST /api/compile-test`
- `GET /api/cron/aggregate-benchmarks`

## Testing

Run full test suite:

```bash
npm run test
```

Tests are organized in [`src/__tests__`](src/__tests__) with dedicated suites for scaffold, profiler, and API flows.

## Database notes

Schema and migrations are managed in [`prisma/schema.prisma`](prisma/schema.prisma) and [`prisma/migrations`](prisma/migrations).

Current migrations include user, scaffold/profiler, and benchmark-related tables used by the application.

## Blueprint + planning docs

- Product/technical blueprint: [`memory-bank/blueprint.md`](memory-bank/blueprint.md)
- Detailed implementation plan: [`memory-bank/implementation-plan.md`](memory-bank/implementation-plan.md)
- Progress tracking: [`progress.md`](progress.md)

## Deployment

The repository includes [`vercel.json`](vercel.json) for Vercel deployment alignment. For production:

1. Provision PostgreSQL and set `DATABASE_URL`.
2. Set required env vars in your deployment platform.
3. Run migrations against production DB.
4. Deploy Next.js app.

## License

This project is provided for hackathon/prototyping use unless a separate license file is added.
