import Link from 'next/link';

const features = [
  {
    title: 'Scaffold',
    description:
      'Generate production-ready, PVM-compatible Solidity contract templates with configurable options and instant export.',
    href: '/scaffold',
    cta: 'Open Scaffold',
  },
  {
    title: 'Profiler',
    description:
      'Benchmark deployed contracts and compare PVM weight metrics with EVM gas estimations in a single workflow.',
    href: '/profiler',
    cta: 'Open Profiler',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20 lg:px-10">
        <section className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-sm font-medium text-sky-200">
            PVMforge
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Build and optimize smart contracts for Polkadot Virtual Machine.
            </h1>
            <p className="mx-auto max-w-3xl text-base text-slate-300 sm:text-lg lg:mx-0">
              PVMforge accelerates contract development from scaffold generation to performance analysis so teams can ship safer contracts faster.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/scaffold"
              className="inline-flex w-full items-center justify-center rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 sm:w-auto"
            >
              Start Scaffolding
            </Link>
            <Link
              href="/docs"
              className="inline-flex w-full items-center justify-center rounded-lg border border-slate-600 bg-slate-800/60 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-800 sm:w-auto"
            >
              Read Docs
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/30"
            >
              <h2 className="text-2xl font-semibold text-slate-50">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{feature.description}</p>
              <Link
                href={feature.href}
                className="mt-6 inline-flex items-center text-sm font-semibold text-sky-300 hover:text-sky-200"
              >
                {feature.cta} →
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
