-- CreateTable
CREATE TABLE "weight_results" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "function_name" VARCHAR(100) NOT NULL,
    "function_signature" VARCHAR(200) NOT NULL,
    "ref_time" BIGINT,
    "proof_size" BIGINT,
    "storage_deposit" BIGINT,
    "evm_gas_estimate" BIGINT,
    "raw_response" JSONB,
    "measured_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weight_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_weight_session" ON "weight_results"("session_id");

-- AddForeignKey
ALTER TABLE "weight_results" ADD CONSTRAINT "weight_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "profiler_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
