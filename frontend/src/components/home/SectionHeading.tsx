export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-4">
        <span className="hidden h-px w-24 bg-slate-300 sm:block" />
        <h2 className="text-xl font-medium md:text-2xl">{title}</h2>
        <span className="hidden h-px w-24 bg-slate-300 sm:block" />
      </div>
      {subtitle && <p className="mx-auto mt-6 max-w-2xl text-slate-600">{subtitle}</p>}
    </div>
  );
}