-- CreateTable
CREATE TABLE "scaffold_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "config" JSONB NOT NULL,
    "contract_name" VARCHAR(100) NOT NULL,
    "contract_type" VARCHAR(50) NOT NULL,
    "oz_version" VARCHAR(10) NOT NULL DEFAULT '5.x',
    "warnings" JSONB,
    "errors" JSONB,
    "compile_success" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scaffold_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiler_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "contract_address" VARCHAR(42) NOT NULL,
    "network" VARCHAR(50) NOT NULL DEFAULT 'polkadot-hub-testnet',
    "abi" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiler_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_scaffold_user" ON "scaffold_sessions"("user_id");

-- CreateIndex
CREATE INDEX "idx_profiler_address" ON "profiler_sessions"("contract_address");

-- AddForeignKey
ALTER TABLE "scaffold_sessions" ADD CONSTRAINT "scaffold_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiler_sessions" ADD CONSTRAINT "profiler_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
