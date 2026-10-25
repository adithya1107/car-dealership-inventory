import { SectionHeading } from './SectionHeading';

const reviews = [
  { name: 'Órlaith Parastu', note: 'Bought Tesla Model 3', highlight: false },
  { name: 'Melina Nesterenko', note: 'Bought Tesla Model 3 · $85,000', highlight: true },
  { name: 'Eve Artie', note: 'Bought Tesla Model 3 · $85,000', highlight: false },
];

const initials = (name: string) => name.split(' ').map((p) => p[0]).slice(0, 2).join('');

export function Testimonials() {
  return (
    <section id="feedback" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20">
      <SectionHeading title="Our Customer Feedback" />
      <div className="mt-12 grid items-center gap-6 md:grid-cols-3">
        {reviews.map((r) => (
          <figure
            key={r.name}
            className={`rounded-xl bg-white p-6 transition ${
              r.highlight ? 'border-l-4 border-brand shadow-xl md:scale-105' : 'shadow-sm'
            }`}
          >
            <figcaption className="flex items-center gap-3">
              <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-navy text-sm font-semibold text-white">
                {initials(r.name)}
              </span>
              <span>
                <span className="block text-sm font-bold">{r.name}</span>
                <span className="block text-xs text-slate-500">{r.note}</span>
              </span>
            </figcaption>
            <blockquote className="mt-4 text-sm leading-relaxed text-slate-500">
              The listing was spot on. Everything worked well, the process was simple and we didn’t need anything else on top.
            </blockquote>
          </figure>
        ))}
      </div>
    </section>
  );
}