import Link from 'next/link';

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <header className="mb-10 space-y-4">
          <p className="text-sm font-medium uppercase tracking-widest text-sky-300">Docs</p>
          <h1 className="text-4xl font-bold tracking-tight">PVMforge Quick Start</h1>
          <p className="text-slate-300">
            Learn the fastest path to scaffold a PVM-compatible contract and run a weight profile against a deployed address.
          </p>
        </header>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-semibold text-white">How to scaffold</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-300">
              <li>Open the Scaffold tool and pick your contract type and features.</li>
              <li>Enable PVM options to apply compatibility adjustments automatically.</li>
              <li>Click Generate to produce contract source, config, deploy script, and README.</li>
              <li>Copy individual files or download a complete project zip.</li>
            </ol>
            <Link
              href="/scaffold"
              className="mt-5 inline-flex rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Go to Scaffold
            </Link>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-semibold text-white">How to profile</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-300">
              <li>Deploy your contract on Polkadot Hub Testnet.</li>
              <li>Open Profiler and enter the deployed contract address.</li>
              <li>Submit to start a profiling session and wait for completion.</li>
              <li>Review ref time, proof size, storage deposit, and EVM gas comparison.</li>
            </ol>
            <Link
              href="/profiler"
              className="mt-5 inline-flex rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-800"
            >
              Go to Profiler
            </Link>
          </section>
        </div>

        <footer className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-400">
          <Link href="/" className="text-sky-300 hover:text-sky-200">
            ← Back to landing page
          </Link>
        </footer>
      </div>
    </main>
  );
}
