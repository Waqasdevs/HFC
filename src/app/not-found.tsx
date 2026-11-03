import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#010102] text-[#F5F5F7] flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-[520px] w-full rounded-2xl bg-[#181818] p-2">
        <div className="rounded-lg bg-[#1F1F1F] p-8 flex flex-col items-start gap-6">
          <span className="font-mono caption-2 text-[#58F6B1] py-1 px-2.5 rounded-md bg-[#272727] not-italic">
            404 • TICKET NOT FOUND AT PASS
          </span>
          <h1 className="heading-2 text-[#F5F5F7] balance-heading not-italic">
            This table or route does not exist on the floor plan.
          </h1>
          <p className="body-4 text-[#9B9B9B] pretty-body not-italic">
            Return to the HFC OS Pakistan overview or jump straight into the live offline POS terminal.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/"
              className="py-2 px-3 rounded-lg bg-[#AD96F1] text-[#010102] caption-1 transition-transform duration-200 ease-weighted active:scale-[0.97] not-italic"
            >
              Back to Overview
            </Link>
            <Link
              href="/pos"
              className="py-2 px-3 rounded-lg bg-[#272727] text-[#F5F5F7] caption-1 transition-transform duration-200 ease-weighted active:scale-[0.97] not-italic"
            >
              Open Live POS
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
