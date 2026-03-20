-- Ensure UUID generator is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "public_benchmarks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contract_type" VARCHAR(50) NOT NULL,
    "function_name" VARCHAR(100) NOT NULL,
    "avg_ref_time" BIGINT,
    "avg_proof_size" BIGINT,
    "avg_evm_gas" BIGINT,
    "sample_count" INTEGER NOT NULL DEFAULT 1,
    "last_updated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_benchmarks_type" ON "public_benchmarks"("contract_type", "function_name");
